import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server' 
  
const isProtectedRoute = createRouteMatcher([ 
  '/dashboard(.*)', 
  '/repo(.*)', 
  '/api/ingest(.*)', 
  '/api/chat(.*)', 
  '/api/review(.*)', 
  '/api/health(.*)', 
]) 
  
export default clerkMiddleware(async (auth, req) => { 
  if (isProtectedRoute(req)) await auth.protect() 
}) 
  
export const config = { 
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'], 
} 
