import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { repos } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { neon } from '@neondatabase/serverless'
import Groq from 'groq-sdk'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' }, { status: 401 }
    )
  }

  const { repoId } = await req.json()
  
  if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API Key missing' }, { status: 500 })
  }

  const groq = new Groq({ 
    apiKey: process.env.GROQ_API_KEY 
  })
  
  const sql = neon(process.env.DATABASE_URL!)

  // Fetch repo details
  const repo = await db.select()
    .from(repos)
    .where(eq(repos.id, repoId))
    .limit(1)

  if (!repo.length) {
    return NextResponse.json(
      { error: 'Repo not found' }, { status: 404 }
    )
  }

  // Fetch top files from embeddings
  const files = await sql`
    SELECT DISTINCT ON (file_path) 
      file_path, content
    FROM embeddings
    WHERE repo_id = ${repoId}::uuid
    ORDER BY file_path, chunk_index
    LIMIT 20
  `

  const filesSummary = files
    .map((f: any) => 
      `File: ${f.file_path}\n${f.content.slice(0, 200)}`
    )
    .join('\n\n---\n\n')

  const repoData = repo[0]

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an expert developer. Generate professional README.md files. Return ONLY markdown, no explanation.'
      },
      {
        role: 'user',
        content: `Generate a professional README.md for:
          
          Repo: ${repoData.repoName}
          Owner: ${repoData.owner}
          Description: ${repoData.description}
          Language: ${repoData.language}
          GitHub: ${repoData.repoUrl}
          
          Code files sample:
          ${filesSummary}
          
          Include these sections:
          # Project Name
          ## About
          ## Features
          ## Tech Stack
          ## Getting Started
          ## Installation
          ## Usage
          ## Contributing
          ## License
          
          Make it professional and detailed.`
      }
    ],
    max_tokens: 2048,
  })

  const readme = completion.choices[0].message.content || ''
  
  return NextResponse.json({ readme })
}
