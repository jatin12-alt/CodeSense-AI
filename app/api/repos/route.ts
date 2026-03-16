import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { repos } from '@/lib/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userRepos = await db
      .select()
      .from(repos)
      .where(eq(repos.userId, userId))
      .orderBy(desc(repos.createdAt))

    return NextResponse.json({ repos: userRepos })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch repos'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

