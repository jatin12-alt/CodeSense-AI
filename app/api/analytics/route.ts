import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { repos } from '@/lib/schema'
import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { count, eq, sql, gte } from 'drizzle-orm'
import { neon } from '@neondatabase/serverless'

// Define the analytics table here since we cannot modify lib/schema.ts
const analytics = pgTable('analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventType: text('event_type').notNull(),
  userId: text('user_id'),
  ipAddress: text('ip_address'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
})

// For raw SQL (one-time table creation)
const rawSql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    const body = await req.json().catch(() => ({}))
    const { event_type, ...metadata } = body
    
    if (!event_type) {
      return NextResponse.json({ error: 'event_type is required' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for') || 'anonymous'

    // Simple table creation if not exists
    await rawSql`
      CREATE TABLE IF NOT EXISTS analytics (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        event_type TEXT NOT NULL,
        user_id TEXT,
        ip_address TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    await db.insert(analytics).values({
      eventType: event_type,
      userId: userId || null,
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
    const totalUniqueVisitorsResult = await db.select({ 
      count: sql<number>`count(distinct ${analytics.ipAddress})` 
    }).from(analytics)
    const totalUniqueVisitors = Number(totalUniqueVisitorsResult[0]?.count || 0)

    // Total demo runs
    const totalDemoRunsResult = await db.select({ 
      count: count() 
    }).from(analytics)
    .where(eq(analytics.eventType, 'demo_run'))
    const totalDemoRuns = totalDemoRunsResult[0]?.count || 0

    // Total repos indexed (from repos table as requested)
    const totalReposResult = await db.select({ 
      count: count() 
    }).from(repos)
    .where(eq(repos.isIndexed, 1))
    const totalReposIndexed = totalReposResult[0]?.count || 0

    // Today's visitors (unique IPs in the last 24h or since start of today)
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    
    const todaysVisitorsResult = await db.select({ 
      count: sql<number>`count(distinct ${analytics.ipAddress})` 
    }).from(analytics)
    .where(gte(analytics.createdAt, startOfToday))
    const todaysVisitors = Number(todaysVisitorsResult[0]?.count || 0)

    return NextResponse.json({
      totalUniqueVisitors,
      totalDemoRuns,
      totalReposIndexed,
      todaysVisitors
    })
  } catch (error) {
    console.error('Analytics GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
