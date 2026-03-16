import type { Metadata } from 'next' 
import { ClerkProvider } from '@clerk/nextjs' 
import { Syne, DM_Mono } from 'next/font/google' 
import { Toaster } from '@/components/ui/toaster' 
import './globals.css' 
  
const syne = Syne({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800'], 
  variable: '--font-syne', 
}) 
  
const dmMono = DM_Mono({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500'], 
  variable: '--font-dm-mono', 
}) 
  
export const metadata: Metadata = { 
  title: 'CodeSense AI — Chat With Your Codebase', 
  description: 'AI-powered GitHub repository analyzer powered by Gemini 1.5 Pro.', 
} 
  
export default function RootLayout({ 
  children, 
}: { 
  children: React.ReactNode 
}) { 
  return ( 
    <ClerkProvider> 
      <html lang="en" className={`${syne.variable} ${dmMono.variable}`}> 
        <body className="font-mono bg-[#080b10] text-[#e8edf3] antialiased"> 
          {children} 
          <Toaster /> 
        </body> 
      </html> 
    </ClerkProvider> 
  ) 
} 
