import { NextRequest, NextResponse } from 'next/server'
import { geminiModel } from '@/lib/gemini'

const rateLimiter = new Map<string, { 
  count: number; reset: number 
}>()

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 
    req.headers.get('x-real-ip') || 'unknown'
  const now = Date.now()
  const limit = rateLimiter.get(ip)

  if (limit) {
    if (now < limit.reset && limit.count >= 5) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again in 1 hour.' },
        { status: 429 }
      )
    }
    if (now > limit.reset) {
      rateLimiter.set(ip, { count: 1, reset: now + 3600000 })
    } else {
      limit.count++
    }
  } else {
    rateLimiter.set(ip, { count: 1, reset: now + 3600000 })
  }

  const { feature, repoUrl, userInput } = await req.json()

  const prompts: Record<string, string> = {
    chat: `You are CodeSense AI analyzing: ${repoUrl}
Simulate having read the full codebase and answer:
${userInput}
Be specific, mention likely file names and code patterns.
Keep under 300 words. Use markdown formatting.`,

    review: `You are a senior developer reviewing this code:
${userInput}
Provide:
## Overall Assessment
## Critical Issues
## Code Quality
## Improvements (with code examples)
Be specific and educational. Under 400 words.`,

    bug: `You are a bug detection expert analyzing:
${userInput}
Find and explain:
## Bugs Found
## Security Issues  
## Performance Problems
## Quick Fixes
Provide specific fixes for each issue. Under 400 words.`,

    onboarding: `Generate a developer onboarding guide for: ${repoUrl}
## Project Overview
## Tech Stack
## Key Files to Read First
## Setup Instructions
## First Tasks
Be practical and specific. Under 400 words.`
  }

  const prompt = prompts[feature] || prompts.chat

  try {
    const result = await geminiModel.generateContent(prompt)
    const text = result.response.text()
    return NextResponse.json({ result: text })
  } catch (error: any) {
    console.error('Demo API error:', error)
    return NextResponse.json(
      { error: 'AI analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
