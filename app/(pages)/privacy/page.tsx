import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080b10] text-[#e8edf3]">
      <Navbar />
      
      <main className="max-w-3xl mx-auto py-32 px-6">
        <h1 className="font-display font-bold text-4xl mb-2">Privacy Policy</h1>
        <p className="text-[#6b7a8d] font-mono text-sm mb-12">Last updated: March 2025</p>

        <div className="space-y-12 font-mono">
          <section>
            <h2 className="text-xl font-display font-bold mb-4 text-[#00e5a0]">1. Information We Collect</h2>
            <div className="space-y-4 text-[#e8edf3]/80 leading-relaxed text-sm">
              <p>We collect information to provide a better experience when you use CodeSense AI. This includes:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>GitHub repository URLs you submit for analysis.</li>
                <li>Account information provided via Clerk (email, name, and profile picture).</li>
                <li>Usage data and analysis history, including questions asked and AI responses.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold mb-4 text-[#00e5a0]">2. How We Use Your Information</h2>
            <div className="space-y-4 text-[#e8edf3]/80 leading-relaxed text-sm">
              <p>Your information is used for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>To provide and maintain our AI analysis and chat features.</li>
                <li>To improve our service and develop new features.</li>
                <li>To communicate with you about your account or service updates.</li>
                <li><strong>We never sell your personal data to third parties.</strong></li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold mb-4 text-[#00e5a0]">3. Data Storage</h2>
            <div className="space-y-4 text-[#e8edf3]/80 leading-relaxed text-sm">
              <p>We take security seriously and use industry-standard practices to protect your data:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>All data is stored securely in Neon DB (PostgreSQL).</li>
                <li>Code embeddings are stored using pgvector for efficient retrieval.</li>
                <li>All data is encrypted in transit using SSL/TLS.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold mb-4 text-[#00e5a0]">4. Third Party Services</h2>
            <div className="space-y-4 text-[#e8edf3]/80 leading-relaxed text-sm">
              <p>We rely on several trusted third-party services to power CodeSense AI:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Clerk:</strong> For secure authentication and user management.</li>
                <li><strong>Google Gemini API:</strong> For advanced AI analysis and code understanding.</li>
                <li><strong>GitHub API:</strong> For accessing and fetching repository content.</li>
                <li><strong>Neon DB:</strong> For managed PostgreSQL database services.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold mb-4 text-[#00e5a0]">5. Data Retention</h2>
            <div className="space-y-4 text-[#e8edf3]/80 leading-relaxed text-sm">
              <p>We retain your analysis history for a period of 30 days to provide you with a seamless experience. You can choose to delete your account and all associated data at any time through your dashboard settings.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold mb-4 text-[#00e5a0]">6. Contact Us</h2>
            <div className="space-y-4 text-[#e8edf3]/80 leading-relaxed text-sm">
              <p>If you have any questions about this Privacy Policy, please contact us at support@codesenseai.com or through our <a href="/contact" className="text-[#00e5a0] hover:underline">Contact Page</a>.</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
