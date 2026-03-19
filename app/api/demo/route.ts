import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

const rateLimiter = new Map<string, { 
  count: number; reset: number 
}>()

// Periodically clear expired rate limiter entries to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimiter.entries()) {
      if (now > value.reset) {
        rateLimiter.delete(key)
      }
    }
  }, 3600000) // Clear every hour
}

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
Be practical and specific. Under 400 words.`,

    readme: `Generate a PROFESSIONAL README.md for this GitHub project: ${repoUrl}
${userInput}

FOLLOW THIS EXACT STRUCTURE:

# [Project Name] — [One line description]

<p align="center">
  [shields.io badges for tech stack]
</p>

<p align="center">
  <strong>[2 line description]</strong>
</p>

<p align="center">
  [Live Demo badge] [GitHub badge]
</p>

---

## ✨ Features
[Table with Feature | Description]

## 🛠️ Tech Stack  
[Table with Category | Technology]

## 🚀 Getting Started
[Prerequisites, Installation steps]

## 🔑 Environment Variables
[Table with Variable | Description | Required]

## 🌐 Deployment
[Vercel deployment steps]

## 🤝 Contributing
[Standard contributing guide]

## 👨💻 Author
[Author section with LinkedIn + GitHub]

Make it IMPRESSIVE and COMPLETE.
Use emojis, tables, badges.
Return ONLY markdown.`
  }
















































  
  const prompt = prompts[feature] || prompts.chat

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    })
    const text = completion.choices[0].message.content || ''
    return NextResponse.json({ result: text })
  } catch (error: unknown) {
    console.error('Demo API error:', error)
    return NextResponse.json(
      { error: 'AI analysis failed. Please try again.' },
      { status: 500 }
    )
  } 
}
