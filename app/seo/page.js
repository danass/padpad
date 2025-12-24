import SEOKeywords from '@/components/SEOKeywords'

export async function generateMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textpad.cloud'
  
  return {
    title: 'TextPad Online - Free Online Text Editor | Simple Text Editor Online',
    description: 'Free online notepad and plain text editor. Browser text editor with no signup required. Write text online, edit text online instantly. Quick text editor online for all your text editing needs.',
    openGraph: {
      type: 'website',
      url: `${baseUrl}/seo`,
      title: 'TextPad Online - Free Online Text Editor | Simple Text Editor Online',
      description: 'Free online notepad and plain text editor. Browser text editor with no signup required. Write text online, edit text online instantly. Quick text editor online for all your text editing needs.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'TextPad Online - Free Online Text Editor | Simple Text Editor Online',
      description: 'Free online notepad and plain text editor. Browser text editor with no signup required. Write text online, edit text online instantly. Quick text editor online for all your text editing needs.',
    },
    alternates: {
      canonical: `${baseUrl}/seo`,
    },
  }
}

export default function SEOPage() {
  const keywords = 'textpad online, online text editor, free online notepad, plain text editor, browser text editor, simple text editor online, write text online, edit text online, no signup text editor, quick text editor online'
  
  return (
    <>
      <SEOKeywords keywords={keywords} />
  return (
    <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
          {/* H1 with keywords */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            TextPad Online - The Best Free Online Text Editor
          </h1>
          
          {/* Main content with keywords naturally integrated */}
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 mb-6">
              Welcome to <strong>TextPad Online</strong>, the premier <strong>free online notepad</strong> and <strong>plain text editor</strong> designed for simplicity and speed. Our <strong>browser text editor</strong> requires no downloads, no installations, and absolutely <strong>no signup</strong> - just open and start writing.
            </p>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-8 mb-4">
              Why Choose Our Simple Text Editor Online?
            </h2>
            
            <p className="text-gray-700 mb-4">
              <strong>TextPad Online</strong> is the perfect solution for anyone who needs a <strong>quick text editor online</strong>. Whether you're taking notes, writing code, drafting documents, or simply need to <strong>write text online</strong>, our platform provides everything you need in one convenient location.
            </p>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-8 mb-4">
              Edit Text Online Instantly
            </h2>
            
            <p className="text-gray-700 mb-4">
              Our <strong>online text editor</strong> is built for speed and efficiency. With instant loading and real-time editing capabilities, you can <strong>edit text online</strong> without any delays or interruptions. The interface is clean, intuitive, and designed to help you focus on what matters most - your content.
            </p>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-8 mb-4">
              No Signup Required - Start Writing Immediately
            </h2>
            
            <p className="text-gray-700 mb-4">
              Unlike other text editors that require account creation, <strong>TextPad Online</strong> is a true <strong>no signup text editor</strong>. Simply visit our website and start writing immediately. Your work is automatically saved locally, so you never have to worry about losing your content.
            </p>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-8 mb-4">
              Perfect Plain Text Editor for All Your Needs
            </h2>
            
            <p className="text-gray-700 mb-4">
              As a dedicated <strong>plain text editor</strong>, <strong>TextPad Online</strong> focuses on the essentials. No distractions, no unnecessary features - just a clean workspace where you can <strong>write text online</strong> and <strong>edit text online</strong> with ease. Perfect for programmers, writers, students, and professionals alike.
            </p>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-8 mb-4">
              The Ultimate Browser Text Editor
            </h2>
            
            <p className="text-gray-700 mb-4">
              Our <strong>browser text editor</strong> works seamlessly across all modern browsers and devices. Whether you're on desktop, tablet, or mobile, you can access <strong>TextPad Online</strong> from anywhere. No plugins or extensions needed - just pure, fast, reliable text editing in your browser.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Get Started with TextPad Online Today
              </h3>
              <p className="text-gray-700 mb-4">
                Ready to experience the best <strong>simple text editor online</strong>? Start using <strong>TextPad Online</strong> right now. It's free, it's fast, and it's the most convenient way to <strong>write text online</strong> and <strong>edit text online</strong>.
              </p>
              <a 
                href="/" 
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Writing Now - Free Online Text Editor
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

