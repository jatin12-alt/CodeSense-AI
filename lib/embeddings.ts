export async function generateEmbedding( 
  text: string 
): Promise<number[]> { 
  const response = await fetch( 
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`, 
    { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        model: 'models/text-embedding-004', 
        content: { parts: [{ text }] }, 
      }), 
    } 
  ) 
  const data = await response.json() 
  return data.embedding.values 
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
