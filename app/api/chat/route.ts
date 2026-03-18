import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { chats } from '@/lib/schema'
import { chatWithCodebase } from '@/lib/groq'
import { generateEmbedding } from '@/lib/embeddings'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'

type SimilarChunkRow = {
  content: string
  file_path: string
  similarity: number
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' }, { status: 401 }
    )
  }

  const { repoId, repoName, question } = await req.json()

  if (!repoId || !question) {
    return NextResponse.json(
      { error: 'repoId and question required' }, 
      { status: 400 }
    )
  }

  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Step 1 — Generate embedding for question
    const questionEmbedding = await generateEmbedding(question)
    const vectorStr = `[${questionEmbedding.join(',')}]`

    // Step 2 — Similarity search in pgvector
    const rows = await sql`
      SELECT content, file_path,
        1 - (embedding <=> ${vectorStr}::vector) as similarity
      FROM embeddings
      WHERE repo_id = ${repoId}::uuid
      ORDER BY embedding <=> ${vectorStr}::vector
      LIMIT 8
    `
    const similarChunks = rows as unknown as SimilarChunkRow[]

    if (similarChunks.length === 0) {
      return NextResponse.json({ 
        answer: 'No relevant code context found. Make sure the repository is fully indexed.' 
      })
    }

    // Step 3 — Build context from chunks
    const contextChunks = similarChunks.map((chunk) => 
      `File: ${chunk.file_path}\n\n${chunk.content}`
    )

    // Step 4 — Get AI answer
    const answer = await chatWithCodebase(
      question, 
      contextChunks, 
      repoName || 'this repository'
    )

    // Step 5 — Save to chat history
    await db.insert(chats).values({
      repoId,
      userId,
      question,
      answer,
    })

    return NextResponse.json({
      answer,
      sources: similarChunks.map((c) => c.file_path),
    })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Chat failed',
      },
      { status: 500 }
    )
  }
}

// Get chat history for a repo
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' }, { status: 401 }
    )
  }

  const { searchParams } = new URL(req.url)
  const repoId = searchParams.get('repoId')

  if (!repoId) {
    return NextResponse.json(
      { error: 'repoId required' }, { status: 400 }
    )
  }

  try {
    const history = await db.select()
      .from(chats)
      .where(eq(chats.repoId, repoId))
      .orderBy(chats.createdAt)
      .limit(50)

    return NextResponse.json({ history })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to load chat history',
      },
      { status: 500 }
    )
  }
}
