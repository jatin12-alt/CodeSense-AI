import { GoogleGenerativeAI } from '@google/generative-ai' 
  
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!) 
  
export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash', 
}) 
  
export async function chatWithCodebase( 
  question: string, 
  contextChunks: string[], 
  repoName: string 
) { 
  const context = contextChunks.join('\n\n---\n\n') 
  const prompt = ` 
You are an expert senior software developer who has deeply  
studied the "${repoName}" codebase. 
  
Using the code context below, answer the user's question  
 accurately and helpfully. If the answer is not in the context, 
 say so honestly. 
  
 CODE CONTEXT: 
 ${context} 
  
 USER QUESTION: 
 ${question} 
  
 Provide a clear, detailed answer with code examples where relevant. 
 ` 
  const result = await geminiModel.generateContent(prompt) 
  return result.response.text() 
} 
  
export async function reviewCode( 
  codeSnippet: string, 
  context: string 
) { 
  const prompt = ` 
You are a strict but helpful senior software engineer  
 doing a code review. 
  
 Review the following code and provide: 
 1. Overall assessment (1-2 sentences) 
 2. Critical issues (bugs, security problems) 
 3. Code quality issues (readability, maintainability) 
 4. Performance concerns 
 5. Specific improvement suggestions with corrected code examples 
  
 CODE TO REVIEW: 
 ${codeSnippet} 
  
 REPO CONTEXT: 
 ${context} 
 ` 
  const result = await geminiModel.generateContent(prompt) 
  return result.response.text() 
} 
  
export async function analyzeCodeHealth( 
  files: Array<{ path: string; content: string }> 
) { 
  const filesSummary = files 
    .slice(0, 20) 
    .map(f => `FILE: ${f.path}\n${f.content.slice(0, 300)}`) 
    .join('\n\n---\n\n') 
  
  const prompt = ` 
You are a code quality expert. Analyze this codebase and  
 return ONLY a valid JSON object. No markdown, no explanation. 
  
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
   "summary": "2-3 sentence overall assessment" 
 } 
  
 CODEBASE SAMPLE: 
 ${filesSummary} 
 ` 
  const result = await geminiModel.generateContent(prompt) 
  const text = result.response.text().trim() 
  try { 
    return JSON.parse(text) 
  } catch { 
    const match = text.match(/\{[\s\S]*\}/) 
    if (match) return JSON.parse(match[0]) 
    throw new Error('Health analysis parse failed') 
  } 
} 
