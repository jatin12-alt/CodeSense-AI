import { GoogleGenerativeAI } from '@google/generative-ai'

export async function generateEmbedding(
  text: string
): Promise<number[]> {
  const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY!
  )
  const model = genAI.getGenerativeModel({
    model: 'gemini-embedding-001'
  })
  const result = await model.embedContent(text)
  return result.embedding.values
}

export function chunkText( 
  text: string, 
  chunkSize = 500 
): string[] { 
  const lines = text.split('\n') 
  const chunks: string[] = [] 
  let current = '' 
  
  for (const line of lines) { 
    if ( 
      (current + line).length > chunkSize &&  
      current.length > 0 
    ) { 
      chunks.push(current.trim()) 
      current = '' 
    } 
    current += line + '\n' 
  } 
  
  if (current.trim()) chunks.push(current.trim()) 
  return chunks 
} 
