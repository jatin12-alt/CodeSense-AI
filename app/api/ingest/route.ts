import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { repos } from '@/lib/schema'
import { parseGitHubUrl, getRepoInfo, getRepoFiles } from '@/lib/github'
import { generateEmbedding, chunkText } from '@/lib/embeddings'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { repoUrl } = await req.json()
  if (!repoUrl) {
    return new Response('Repo URL required', { status: 400 })
  }

  // SSE Stream setup
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (
        progress: number,
        message: string,
        data?: Record<string, unknown>,
      ) => {
        const payload = JSON.stringify(
          data ? { progress, message, ...data } : { progress, message },
        )
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
      }

      try {
        // Step 1 — Parse URL
        send(5, 'Parsing repository URL...')
        const { owner, repo } = parseGitHubUrl(repoUrl)

        // Step 2 — Fetch repo info
        send(10, 'Fetching repository info...')
        const repoInfo = await getRepoInfo(owner, repo)

        // Step 3 — Check if already indexed
        const existing = await db.select()
          .from(repos)
          .where(eq(repos.repoUrl, repoUrl))
          .limit(1)

        let repoId: string

        if (existing.length > 0 && existing[0].isIndexed === 1) {
          send(100, 'Repository already indexed!', 
            { repoId: existing[0].id, alreadyIndexed: true })
          controller.close()
          return
        }

        // Step 4 — Create/Update repo record
        send(15, 'Saving repository to database...')
        if (existing.length > 0) {
          repoId = existing[0].id
          await db.update(repos)
            .set({ isIndexed: 0 })
            .where(eq(repos.id, repoId))
        } else {
          const inserted = await db.insert(repos).values({
            userId,
            repoUrl,
            repoName: repoInfo.name,
            owner,
            description: repoInfo.description || '',
            language: repoInfo.language || '',
            isIndexed: 0,
          }).returning()
          repoId = inserted[0].id
        }

        // Step 5 — Fetch all files
        send(25, 'Fetching repository files...')
        const files = await getRepoFiles(owner, repo)
        send(40, `Found ${files.length} files. Processing...`)

        // Step 6 — Delete old embeddings if re-indexing
        const sql = neon(process.env.DATABASE_URL!)
        await sql`DELETE FROM embeddings WHERE repo_id = ${repoId}`

        // Step 7 — Generate embeddings for each file
        let processed = 0
        for (const file of files) {
          const chunks = chunkText(file.content, 500)
          
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i]
            if (!chunk.trim()) continue

            try {
              const embedding = await generateEmbedding(
                `File: ${file.path}\n\n${chunk}`
              )
              
              const vectorStr = `[${embedding.join(',')}]`
              await sql`
                INSERT INTO embeddings 
                (repo_id, file_path, chunk_index, content, embedding)
                VALUES (
                  ${repoId}::uuid,
                  ${file.path},
                  ${i},
                  ${chunk},
                  ${vectorStr}::vector
                )
              `
            } catch (e) {
              console.error(`Embedding error for ${file.path}:`, e)
            }
          }
          
          processed++
          const progress = 40 + Math.floor((processed / files.length) * 50)
          if (processed % 5 === 0 || processed === files.length) {
            send(progress, 
              `Processing files... (${processed}/${files.length})`)
          }
        }

        // Step 8 — Mark repo as indexed
        send(95, 'Finalizing...')
        await db.update(repos)
          .set({ 
            isIndexed: 1, 
            totalFiles: files.length 
          })
          .where(eq(repos.id, repoId))

        // Step 9 — Done!
        send(100, 'Repository indexed successfully!', { repoId })
        controller.close()

      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Indexing failed'
        const errorMsg = JSON.stringify({ 
          progress: -1, 
          message,
          error: true 
        })
        controller.enqueue(
          encoder.encode(`data: ${errorMsg}\n\n`)
        )
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
