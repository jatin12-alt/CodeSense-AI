import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { repos } from '@/lib/schema'
import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { count, eq, sql, gte } from 'drizzle-orm'

// Define the analytics table here since we cannot modify lib/schema.ts
const analytics = pgTable('analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventType: text('event_type').notNull(),
  userId: text('user_id'),
  ipAddress: text('ip_address'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
})

export async function POST(req: NextRequest) {
  try {
    const { userId: authedUserId } = await auth()
    const body = await req.json().catch(() => ({}))
    const { event_type, user_id, ip_address, ...metadata } = body
    
    if (!event_type) {
      return NextResponse.json({ error: 'event_type is required' }, { status: 400 })
    }

    const ip = ip_address || req.headers.get('x-forwarded-for') || 'anonymous'

    await db.insert(analytics).values({
      eventType: event_type,
      userId: authedUserId || user_id || null,
      ipAddress: ip,
      metadata: metadata || {},
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics POST error:', error)
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Total unique visitors by IP
    const totalVisitorsResult = await db.select({ 
      count: sql<number>`count(distinct ${analytics.ipAddress})` 
    }).from(analytics)
    const totalVisitors = Number(totalVisitorsResult[0]?.count || 0)

    // Total demo runs
    const totalDemoRunsResult = await db.select({ 
      count: count() 
    }).from(analytics)
    .where(eq(analytics.eventType, 'demo_run'))
    const totalDemoRuns = Number(totalDemoRunsResult[0]?.count || 0)

    // Total repos indexed (from repos table)
    const totalReposResult = await db.select({ 
      count: count() 
    }).from(repos)
    .where(eq(repos.isIndexed, 1))
    const totalRepos = Number(totalReposResult[0]?.count || 0)

    // Today's visitors (unique IPs in the last 24h or since start of today)
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    
    const todayVisitorsResult = await db.select({ 
      count: sql<number>`count(distinct ${analytics.ipAddress})` 
    }).from(analytics)
    .where(gte(analytics.createdAt, startOfToday))
    const todayVisitors = Number(todayVisitorsResult[0]?.count || 0)

    return NextResponse.json({
      totalVisitors,
      totalDemoRuns,
      totalRepos,
      todayVisitors
    })
  } catch (error) {
    console.error('Analytics GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
