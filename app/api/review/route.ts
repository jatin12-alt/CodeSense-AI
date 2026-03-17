import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { reviews } from '@/lib/schema'
import { reviewCode } from '@/lib/gemini'
import { generateEmbedding } from '@/lib/embeddings'
import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'

type ReviewContextRow = {
  content: string
  file_path: string
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' }, { status: 401 }
    )
  }

  const { repoId, codeSnippet, prUrl } = await req.json()

  if (!repoId || !codeSnippet) {
    return NextResponse.json(
      { error: 'repoId and codeSnippet required' }, 
      { status: 400 }
    )
  }

  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Fetch repo architecture context
    const codeEmbedding = await generateEmbedding(codeSnippet)
    const vectorStr = `[${codeEmbedding.join(',')}]`

    const contextChunks = await sql<ReviewContextRow>`
      SELECT content, file_path
      FROM embeddings
      WHERE repo_id = ${repoId}::uuid
      ORDER BY embedding <=> ${vectorStr}::vector
      LIMIT 5
    `

    const context = contextChunks
      .map((c) => `File: ${c.file_path}\n${c.content}`)
      .join('\n\n---\n\n')

    // Get AI review
    const reviewContent = await reviewCode(codeSnippet, context)

    // Save review
    await db.insert(reviews).values({
      repoId,
      userId,
      prUrl: prUrl || null,
      codeSnippet,
      reviewContent,
    })

    return NextResponse.json({ review: reviewContent })

  } catch (error) {
    console.error('Review error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Review failed',
      },
      { status: 500 }
    )
  }
}

// Get review history
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
      .from(reviews)
      .where(eq(reviews.repoId, repoId))
      .orderBy(reviews.createdAt)
      .limit(20)

    return NextResponse.json({ history })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to load review history',
      },
      { status: 500 }
    )
  }
}
