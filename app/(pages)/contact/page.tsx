'use client'

import React, { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Github, Linkedin, Mail } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch (error) {
      console.error('Contact form submission error:', error)
      setStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080b10] text-[#e8edf3]">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left — Contact Info */}
          <div className="space-y-8">
            <div>
              <h1 className="font-display font-bold text-5xl mb-6">Get In Touch</h1>
              <p className="text-[#6b7a8d] text-lg font-mono max-w-sm leading-relaxed">
                Have questions about CodeSense AI? We&apos;d love to hear from you.
              </p>
            </div>

            <div className="space-y-4 font-mono">
              <a
                href="https://github.com/jatin12-alt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520] hover:border-[rgba(0,229,160,0.2)] transition-colors group"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[rgba(0,229,160,0.1)] text-[#00e5a0]">
                  <Github size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-[#6b7a8d] uppercase tracking-wider">GitHub Profile</div>
                  <div className="text-sm group-hover:text-[#00e5a0] transition-colors">github.com/jatin12-alt</div>
                </div>
              </a>

              <a
                href="https://github.com/jatin12-alt/CodeSense-AI.git"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520] hover:border-[rgba(0,229,160,0.2)] transition-colors group"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[rgba(0,229,160,0.1)] text-[#00e5a0]">
                  <Github size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-[#6b7a8d] uppercase tracking-wider">Project Repository</div>
                  <div className="text-sm group-hover:text-[#00e5a0] transition-colors">CodeSense-AI.git</div>
                </div>
              </a>

              <a
                href="https://www.linkedin.com/in/jatin-dongre-6a13a3294"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520] hover:border-[rgba(0,170,255,0.2)] transition-colors group"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[rgba(0,170,255,0.1)] text-[#00aaff]">
                  <Linkedin size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-[#6b7a8d] uppercase tracking-wider">LinkedIn</div>
                  <div className="text-sm group-hover:text-[#00aaff] transition-colors">Jatin Dongre</div>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520]">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[rgba(232,237,243,0.05)] text-[#e8edf3]">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-[#6b7a8d] uppercase tracking-wider">Email</div>
                  <div className="text-sm">support@codesenseai.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Contact Form */}
          <div className="bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-2xl p-8 relative overflow-hidden">
            {status === 'success' ? (
              <div className="text-center py-12 animate-in fade-in zoom-in duration-300">
                <div className="text-5xl mb-6">✅</div>
                <h3 className="font-display font-bold text-2xl mb-4 text-[#e8edf3]">Message Sent!</h3>
                <p className="text-[#6b7a8d] text-base font-mono max-w-xs mx-auto">
                  Thanks for reaching out! We&apos;ll get back to you as soon as possible.
                </p>
                <Button 
                  onClick={() => setStatus('idle')}
                  className="mt-8 hover:bg-[#00e5a0] hover:text-black transition-colors"
                  variant="outline"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <div className="relative">
                <form onSubmit={handleSubmit} className={`space-y-6 transition-opacity duration-300 ${isSubmitting ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-[10px] uppercase tracking-widest text-[#6b7a8d] font-mono">Name</label>
                    <input
                      id="name"
                      type="text"
                      required
                      disabled={isSubmitting}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your Name"
                      className="w-full bg-[#080b10] border border-[rgba(255,255,255,0.07)] text-[#e8edf3] rounded-lg p-3 font-mono text-sm focus:border-[#00e5a0] focus:outline-none transition disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-[10px] uppercase tracking-widest text-[#6b7a8d] font-mono">Email</label>
                    <input
                      id="email"
                      type="email"
                      required
                      disabled={isSubmitting}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full bg-[#080b10] border border-[rgba(255,255,255,0.07)] text-[#e8edf3] rounded-lg p-3 font-mono text-sm focus:border-[#00e5a0] focus:outline-none transition disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-[10px] uppercase tracking-widest text-[#6b7a8d] font-mono">Message</label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      disabled={isSubmitting}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we help?"
                      className="w-full bg-[#080b10] border border-[rgba(255,255,255,0.07)] text-[#e8edf3] rounded-lg p-3 font-mono text-sm focus:border-[#00e5a0] focus:outline-none transition resize-none disabled:opacity-50"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-red-400 text-xs font-mono animate-in slide-in-from-top-2 duration-300">
                      ❌ Failed to send message. Please try again.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#00e5a0] text-black font-mono font-medium px-8 py-3 rounded-lg hover:bg-[#00ffb3] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      'Send Message →'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>

  )
}
