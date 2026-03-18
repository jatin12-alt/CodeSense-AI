import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export const groqClient = groq

export async function chatWithCodebase(
  question: string,
  contextChunks: string[],
  repoName: string
) {
  const context = contextChunks.join('\n\n---\n\n')
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an expert senior software 
          developer who has deeply studied the 
          "${repoName}" codebase. Answer questions 
          accurately using the code context provided.`,
      },
      {
        role: 'user',
        content: `CODE CONTEXT:\n${context}
          \n\nQUESTION: ${question}`,
      },
    ],
    max_tokens: 1024,
  })
  return completion.choices[0].message.content || ''
}

export async function reviewCode(codeSnippet: string, context: string) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a strict but helpful 
          senior software engineer doing code review.`,
      },
      {
        role: 'user',
        content: `Review this code:
          \n\nCODE:\n${codeSnippet}
          \n\nREPO CONTEXT:\n${context}
          
          Provide:
          ## Overall Assessment
          ## Critical Issues
          ## Code Quality
          ## Improvements (with code examples)`,
      },
    ],
    max_tokens: 1024,
  })
  return completion.choices[0].message.content || ''
}

export async function analyzeCodeHealth(
  files: Array<{ path: string; content: string }>
) {
  const filesSummary = files
    .slice(0, 20)
    .map((f) => `FILE: ${f.path}\n${f.content.slice(0, 300)}`)
    .join('\n\n---\n\n')

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a code quality expert. 
          Return ONLY valid JSON, no markdown.`,
      },
      {
        role: 'user',
        content: `Analyze this codebase and return 
          ONLY a JSON object:
          {
            "overallScore": <0-100>,
            "complexityScore": <0-100>,
            "documentationScore": <0-100>,
            "duplicateScore": <0-100>,
            "bugRiskScore": <0-100>,
            "suggestions": [
              {
                "type": "bug|performance|documentation|structure",
                "file": "filename",
                "issue": "what is wrong",
                "fix": "how to fix it"
              }
            ],
            "summary": "2-3 sentence assessment"
          }
          
          CODEBASE:\n${filesSummary}`,
      },
    ],
    max_tokens: 1024,
  })

  const text = completion.choices[0].message.content || ''
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Health analysis parse failed')
  }
}
