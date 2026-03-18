import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { healthReports } from '@/lib/schema'
import { analyzeCodeHealth } from '@/lib/gemini'
import { neon } from '@neondatabase/serverless'
import { desc, eq } from 'drizzle-orm'

type HealthChunkRow = {
  file_path: string
  content: string
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' }, { status: 401 }
    )
  }

  const { repoId } = await req.json()

  if (!repoId) {
    return NextResponse.json(
      { error: 'repoId required' }, { status: 400 }
    )
  }

  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Fetch all file chunks for this repo
    const rows = await sql`
      SELECT DISTINCT ON (file_path) 
        file_path, content
      FROM embeddings
      WHERE repo_id = ${repoId}::uuid
      ORDER BY file_path, chunk_index
      LIMIT 30
    `
    const allChunks = rows as unknown as HealthChunkRow[]

    if (allChunks.length === 0) {
      return NextResponse.json({ 
        error: 'No indexed files found. Please index the repo first.' 
      }, { status: 400 })
    }

    const files = allChunks.map((c) => ({ 
      path: c.file_path, 
      content: c.content 
    }))

    // Analyze health
    const healthData = await analyzeCodeHealth(files)

    // Save report
    const report = await db.insert(healthReports).values({
      repoId,
      userId,
      overallScore: healthData.overallScore,
      complexityScore: healthData.complexityScore,
      documentationScore: healthData.documentationScore,
      duplicateScore: healthData.duplicateScore,
      bugRiskScore: healthData.bugRiskScore,
      suggestions: healthData.suggestions,
    }).returning()

    return NextResponse.json({ 
      health: healthData,
      reportId: report[0].id
    })

  } catch (error) {
    console.error('Health error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Health analysis failed',
      },
      { status: 500 }
    )
  }
}

// Get latest health report for repo
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
    const report = await db.select()
      .from(healthReports)
      .where(eq(healthReports.repoId, repoId))
      .orderBy(desc(healthReports.createdAt))
      .limit(1)

    if (report.length === 0) {
      return NextResponse.json({ report: null })
    }

    return NextResponse.json({ report: report[0] })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to load health report',
      },
      { status: 500 }
    )
  }
}
