'use client'

import { useEffect, useState, useRef } from 'react'
import { HardDrive, Sparkles, Layout, PenTool, History, Palette, Shield, ChevronDown, Users, Users2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import SEOKeywords from '@/components/SEOKeywords'
import UnifiedEditor from '@/components/editor/UnifiedEditor'
import { useLanguage } from '@/app/i18n/LanguageContext'

const STORAGE_KEY = 'textpad_cloud_unsaved_pad'
const STORAGE_TIMESTAMP_KEY = 'textpad_cloud_unsaved_pad_timestamp'
const STORAGE_PENDING_SAVE_KEY = 'textpad_cloud_pending_save'
const EXPIRY_HOURS = 48

export default function HomeClient({ featuredArticles = [] }) {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const { t } = useLanguage()
  const [saving, setSaving] = useState(false)
  const [hasContent, setHasContent] = useState(false)
  const [initialContent, setInitialContent] = useState(null)
  const [mounted, setMounted] = useState(false)
  const editorRef = useRef(null)

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load content from localStorage
  useEffect(() => {
    if (mounted) {
      const saved = localStorage.getItem(STORAGE_KEY)
      const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY)

      if (saved && timestamp) {
        const ageHours = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60)
        if (ageHours < EXPIRY_HOURS) {
          try {
            const content = JSON.parse(saved)
            setInitialContent(content)
            checkHasContent(content)
          } catch (e) {
            console.error('Error parsing saved content:', e)
          }
        } else {
          localStorage.removeItem(STORAGE_KEY)
          localStorage.removeItem(STORAGE_TIMESTAMP_KEY)
        }
      }
    }
  }, [mounted])

  const checkHasContent = (json) => {
    if (!json) {
      setHasContent(false)
      return
    }

    // Check for images or other non-empty nodes
    let hasActualContent = false
    if (json?.content && Array.isArray(json.content)) {
      hasActualContent = json.content.some(node => {
        if (node.type === 'text' && node.text?.trim().length > 0) return true
        if (node.type === 'image' || node.type === 'resizableImage') return true
        if (node.type === 'video' || node.type === 'audio' || node.type === 'youtube') return true
        if (node.type === 'drawing') return true
        if (node.content && node.content.length > 0) {
          // Recursive check for nested content (simplified for efficiency)
          return JSON.stringify(node.content).includes('"text"') || JSON.stringify(node.content).includes('"image"')
        }
        return false
      })
    }
    setHasContent(hasActualContent)
  }

  const handleUpdate = (content) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
      localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString())
      checkHasContent(content)
    } catch (err) {
      console.error('Error saving to localStorage:', err)
    }
  }

  const handleSave = async () => {
    const content = editorRef.current?.getContent()
    if (!content) return

    setSaving(true)
    try {
      if (!session) {
        // Create a disposable document
        const response = await fetch('/api/documents/disposable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Untitled',
            content: content
          }),
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.removeItem(STORAGE_KEY)
          localStorage.removeItem(STORAGE_TIMESTAMP_KEY)
          localStorage.removeItem(STORAGE_PENDING_SAVE_KEY)
          router.push(`/public/temp/${data.document.id}`)
        } else {
          alert('Failed to save temporary document')
        }
        return
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled',
          folder_id: null,
          content: content
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(STORAGE_TIMESTAMP_KEY)
        localStorage.removeItem(STORAGE_PENDING_SAVE_KEY)
        router.push(`/doc/${data.document.id}`)
      } else {
        alert('Failed to save document')
      }
    } catch (error) {
      console.error('Error saving document:', error)
      alert('Failed to save document')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const keywords = 'blocnote online, textpad online, online text editor with pictures, free online notepad, write text online, edit text online, blocnote en ligne, bloc-notes en ligne avec images, éditeur de texte en ligne, text sharing, simple text editor'

  return (
    <>
      <SEOKeywords keywords={keywords} />
      <main className="min-h-screen bg-white">
        <h1 className="absolute opacity-0 pointer-events-none">Blocnote Online - Textpad Online Text Editor with Pictures</h1>
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8">

          {mounted && (
            <UnifiedEditor
              ref={editorRef}
              initialContent={initialContent}
              onUpdate={handleUpdate}
              onSave={handleSave}
              saving={saving}
              hasChanges={hasContent}
              placeholderText={t?.editorPlaceholder || 'Tell your story...'}
              features={{
                showToolbar: true,
                showBubbleMenu: true,
                showFloatingMenu: true,
                showContextMenu: true,
                showIpfsBrowser: true,
                showSaveButton: !session,
                saveButtonIconOnly: true
              }}
              className="font-['DM_Sans',sans-serif] min-h-[70vh] md:min-h-[500px] pb-24 md:pb-8"
            />
          )}

          {/* Landing Section - Only show when not logged in */}
          {!session && (
            <div className="mt-20 md:mt-32 space-y-24 md:space-y-40 pb-32 font-['DM_Sans',sans-serif]">
              {/* Hero tagline */}
              <div className="text-center max-w-4xl mx-auto px-4">
                <div className="mb-8 flex justify-center">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white p-2">
                    <img src="/padpad.png" alt="Textpad Logo" className="w-full h-full object-cover" />
                  </div>
                </div>
                <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-gray-900 mb-6 leading-[1.1]">
                  The Permanent Notepad for the <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">Creative Web</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-500 font-normal max-w-2xl mx-auto">
                  A decentralized text editor built on IPFS. Your thoughts, sketches, and documents — saved to the permanent web without a required account.
                </p>
              </div>

              {/* Why use Textpad */}
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-16 tracking-tight">
                  The Textpad Edge
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                  {[
                    { icon: <HardDrive className="w-5 h-5" />, title: 'IPFS Persistence', desc: 'Save your work directly to the permanent web. Censorship-resistant and decentralized storage.', href: '/features/decentralized-storage' },
                    { icon: <Sparkles className="w-5 h-5" />, title: 'Digital Legacy', desc: 'Write now, publish on your 99th birthday. Preserve your words for future generations automatically.', href: '/features/digital-testament' },
                    { icon: <Layout className="w-5 h-5" />, title: 'Smart Drive & Tabs', desc: 'Organize work in folders and switch between multiple documents with browser-like tabs.', href: '/features/tabs-and-drive' },
                    { icon: <PenTool className="w-5 h-5" />, title: 'Visual Sketching', desc: 'Break free from text. Sketch and draw directly inside your document flow with integrated tools.', href: '/features/images-and-drawings' },
                    { icon: <Layout className="w-5 h-5" />, title: 'Instant Publishing', desc: 'Transform any note into a professional blog post on your own custom subdomain in one click.', href: '/features/public-blog' },
                    { icon: <Palette className="w-5 h-5" />, title: 'Rich Media First', desc: 'Native support for drive videos, YouTube, audio, and high-fidelity drawings.', href: '/features/rich-media' },
                    { icon: <History className="w-5 h-5" />, title: 'Infinite History', desc: 'Travel back in time with automatic backups and a deep event logs of every character change.', href: '/features/version-history' },
                    { icon: <Shield className="w-5 h-5" />, title: 'Link-Based Privacy', desc: 'Your work is private by default, shared only via unique links or your public digital archive.', href: '/features/shareable-links' },
                  ].map((feature, i) => (
                    <NextLink key={i} href={feature.href} className="group flex flex-col gap-4 p-4 -m-4 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                      </div>
                    </NextLink>
                  ))}
                </div>
              </div>

              {/* Who is Textpad for? */}
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-16 tracking-tight">
                  Who is Textpad for?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {[
                    { icon: <History className="w-6 h-6" />, title: 'Legacy Builders', desc: 'Create a digital time capsule. Preserve memories, stories, and wisdom for your children or grandchildren to discover.' },
                    { icon: <HardDrive className="w-6 h-6" />, title: 'Web3 Architects', desc: 'Save critical research and thoughts directly to the decentralized web using the permanent IPFS gateway.' },
                    { icon: <Layout className="w-6 h-6" />, title: 'Digital Nomads', desc: 'Organize your entire writing life in a clean, folder-based drive with browser-like tabs that persist across all devices.' },
                    { icon: <PenTool className="w-6 h-6" />, title: 'Creative Minds', desc: 'Fuse technical writing with hand-drawn sketches and rich media to build documents that are truly multi-dimensional.' },
                    { icon: <Sparkles className="w-6 h-6" />, title: 'Minimalists', desc: 'Quickly jot down inspirations in a friction-free environment that values your focus more than your credentials.' },
                    { icon: <Users className="w-6 h-6" />, title: 'Public Thinkers', desc: 'Publish your inner work to a custom subdomain blog and build a public presence on your own terms.' },
                  ].map((user, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100 group-hover:bg-cyan-50">
                        {user.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{user.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{user.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-medium text-gray-900 text-center mb-16 tracking-tight">
                  Questions & Answers
                </h2>
                <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
                  {[
                    { q: 'What makes Textpad different?', a: 'Unlike standard notepads, Textpad combines a high-end visual editor with decentralized storage (IPFS) and professional publishing tools. It is built for permanence and creative freedom.' },
                    { q: 'Is it really decentralized?', a: 'Yes. When you choose to save via IPFS, your document is cast to the permanent web. This ensures your content remains accessible even if central servers go down.' },
                    { q: 'Can I use it as a blog?', a: 'Absolutely. By creating a free account, you can publish any document to your personal subdomain (e.g., yourname.textpad.cloud) instantly.' },
                    { q: 'How does link-based privacy work?', a: 'Until you publish a document to your public blog, it is only accessible via its unique, obfuscated link. We do not index your private drafts or share them with third parties.' },
                    { q: 'Is there a limit to what I can store?', a: 'Local storage and standard cloud saving are unlimited for text. For heavy media and permanence, our IPFS integration provides a robust way to manage larger creative works.' },
                    { q: 'What can I use Textpad for?', a: 'Textpad is designed to be a versatile online text editor for everything from quick jotting to professional writing. Users find us when searching for a free online notepad, a "bloc-notes en ligne", or a robust online text editor with pictures. Whether you need a simple éditeur de texte en ligne or a platform for permanent text sharing, Textpad is built to scale with your ideas.' },
                  ].map((faq, i) => (
                    <details key={i} className="group py-6">
                      <summary className="flex justify-between items-center cursor-pointer list-none">
                        <span className="text-lg font-medium text-gray-900">{faq.q}</span>
                        <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="mt-4 text-gray-500 leading-relaxed text-base prose prose-sm max-w-none">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* Effortless note-taking */}
              <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white rounded-3xl p-8 md:p-16 text-center border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles className="w-24 h-24 text-cyan-600" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-6 underline decoration-cyan-400 decoration-4 underline-offset-8">The Ultimate Online Notepad</h2>
                  <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                    Textpad is more than just a <strong>free online notepad</strong>. It's a professional <strong>online text editor</strong> tailored for the creative web. Whether you're using it as a <strong>bloc-notes en ligne</strong>, a platform for <strong>text sharing</strong>, or a digital vault for your legacy, we ensure your work is permanent, private, and always yours.
                  </p>
                  <button
                    onClick={() => {
                      if (initialContent) {
                        // If already has content, just scroll up
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      } else {
                        // Otherwise focus editor (it will be at the top)
                        editorRef.current?.focus()
                      }
                    }}
                    className="px-8 py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                  >
                    Create Your First Note
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
