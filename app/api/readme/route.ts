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
        content: `Generate a PROFESSIONAL README.md for this GitHub project.

Project Details:
- Name: ${repoData.repoName}
- Owner: ${repoData.owner}  
- Description: ${repoData.description}
- Language: ${repoData.language}
- GitHub: ${repoData.repoUrl}

Code Sample:
${filesSummary}

FOLLOW THIS EXACT STRUCTURE:

# ${repoData.repoName} — [One line description]

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

## 📁 Project Structure
[Code block with folder tree]

## 🚀 Getting Started
[Prerequisites, Installation steps]

## 🔑 Environment Variables
[Table with Variable | Description | Required]

## 🌐 Deployment
[Vercel deployment steps]

## 🤝 Contributing
[Standard contributing guide]

## 📄 License
MIT License

## 👨💻 Author
[Author section with LinkedIn + GitHub]

<p align="center">
  Built with ❤️ by ${repoData.owner}
</p>

Make it IMPRESSIVE and COMPLETE.
Use emojis, tables, badges.
Return ONLY markdown.`
      }
    ],
    max_tokens: 2048,
  })

  const readme = completion.choices[0].message.content || ''
  
  return NextResponse.json({ readme })
}
