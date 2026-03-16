import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { repos } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'
import { neon } from '@neondatabase/serverless'

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = await Promise.resolve(ctx.params)
  const id = params.id

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  try {
    const found = await db
      .select()
      .from(repos)
      .where(and(eq(repos.id, id), eq(repos.userId, userId)))
      .limit(1)

    if (found.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ repo: found[0] })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch repo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = await Promise.resolve(ctx.params)
  const id = params.id

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  try {
    // Best-effort cleanup of embeddings for this repo (table is outside Drizzle schema)
    if (process.env.DATABASE_URL) {
      const sql = neon(process.env.DATABASE_URL)
      await sql`DELETE FROM embeddings WHERE repo_id = ${id}::uuid`
    }

    const deleted = await db
      .delete(repos)
      .where(and(eq(repos.id, id), eq(repos.userId, userId)))
      .returning({ id: repos.id })

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Delete failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

