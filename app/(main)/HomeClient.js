'use client'

import { useEffect, useState, useRef } from 'react'
import { HardDrive, Sparkles, Layout, PenTool, History, Palette, Shield, ChevronDown, Users, Users2, UserMinus } from 'lucide-react'
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
        <h1 className="absolute opacity-0 pointer-events-none">{t?.homeTitle || 'Textpad – The Permanent Notepad for the Creative Web'}</h1>
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8">

          {mounted && (
            <UnifiedEditor
              key={`${t?.editorPlaceholder}-${t?.editorPlaceholderTitle}`}
              ref={editorRef}
              initialContent={initialContent}
              onUpdate={handleUpdate}
              onSave={handleSave}
              saving={saving}
              hasChanges={hasContent}
              placeholderText={t?.editorPlaceholder || 'Tell your story...'}
              placeholderTitle={t?.editorPlaceholderTitle || 'Title'}
              features={{
                showToolbar: true,
                showBubbleMenu: true,
                showFloatingMenu: true,
                showContextMenu: true,
                showIpfsBrowser: true,
                showSaveButton: true,
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
                  {t?.heroTitlePart1 || 'The Permanent Notepad for the '} <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">{t?.heroTitlePart2 || 'Creative Web'}</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-500 font-normal max-w-2xl mx-auto">
                  {t?.heroSubtitle || 'A decentralized text editor built on IPFS. Your thoughts, sketches, and documents — saved to the permanent web without a required account.'}
                </p>
              </div>

              {/* Why use Textpad (The Textpad Edge) */}
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-16 tracking-tight">
                  {t?.homeEdgeTitle || 'The Textpad Edge'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {[
                    { icon: <HardDrive className="w-5 h-5" />, title: t?.featureIPFSTitle || 'IPFS Persistence', desc: t?.featureIPFSDesc || 'Save your work directly to the permanent web. Censorship-resistant and decentralized storage.', href: '/features/decentralized-storage' },
                    { icon: <Sparkles className="w-5 h-5" />, title: t?.featureLegacyTitle || 'Digital Legacy', desc: t?.featureLegacyDesc || 'Write now, publish on your 99th birthday. Preserve your words for future generations automatically.', href: '/features/digital-testament' },
                    { icon: <Layout className="w-5 h-5" />, title: t?.featureDriveTitle || 'Smart Drive & Tabs', desc: t?.featureDriveDesc || 'Organize work in folders and switch between multiple documents with browser-like tabs.', href: '/features/tabs-and-drive' },
                    { icon: <PenTool className="w-5 h-5" />, title: t?.featureSketchTitle || 'Visual Sketching', desc: t?.featureSketchDesc || 'Break free from text. Sketch and draw directly inside your document flow with integrated tools.', href: '/features/images-and-drawings' },
                    { icon: <Layout className="w-5 h-5" />, title: t?.featurePublishTitle || 'Instant Publishing', desc: t?.featurePublishDesc || 'Transform any note into a professional blog post on your own custom subdomain in one click.', href: '/features/public-blog' },
                    { icon: <Palette className="w-5 h-5" />, title: t?.featureMediaTitle || 'Rich Media First', desc: t?.featureMediaDesc || 'Native support for drive videos, YouTube, audio, and high-fidelity drawings.', href: '/features/rich-media' },
                    { icon: <History className="w-5 h-5" />, title: t?.featureHistoryTitle || 'Infinite History', desc: t?.featureHistoryDesc || 'Travel back in time with automatic backups and a deep event logs of every character change.', href: '/features/version-history' },
                    { icon: <Shield className="w-5 h-5" />, title: t?.featurePrivacyTitle || 'Link-Based Privacy', desc: t?.featurePrivacyDesc || 'Your work is private by default, shared only via unique links or your public digital archive.', href: '/features/shareable-links' },
                    { icon: <UserMinus className="w-5 h-5" />, title: t?.featureAccountFreeTitle || 'Account-Free Usage', desc: t?.featureAccountFreeDesc || 'Start writing and save to the permanent web immediately without being required to create an account.', href: '/online-text-editor' },
                  ].map((feature, i) => (
                    <NextLink key={i} href={feature.href} title={feature.title} className="group flex flex-col gap-4 p-4 -m-4 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
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

              {/* Legacy Mid-Break */}
              <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white rounded-3xl p-8 md:p-16 text-center border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles className="w-24 h-24 text-cyan-600" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-6 underline decoration-cyan-400 decoration-4 underline-offset-8">{t?.homeLegacyTitle || 'A legacy for the future'}</h2>
                  <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                    {t?.homeLegacySubtitle || 'Textpad is built for permanence. Whether you\'re drafting a quick thought to IPFS or building a lifelong digital testament to be discovered by future generations, our tools ensure your words survive the test of time.'}
                  </p>
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                      editorRef.current?.focus()
                    }}
                    className="px-8 py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                  >
                    {t?.homeCreateNote || 'Create Your First Note'}
                  </button>
                </div>
              </div>

              {/* Who is Textpad for? */}
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-16 tracking-tight">
                  {t?.homeForWhoTitle || 'Who is Textpad for?'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {[
                    { icon: <History className="w-6 h-6" />, title: t?.userLegacyTitle || 'Legacy Builders', desc: t?.userLegacyDesc || 'Create a digital time capsule. Preserve memories, stories, and wisdom for your children or grandchildren to discover.' },
                    { icon: <HardDrive className="w-6 h-6" />, title: t?.userWeb3Title || 'Web3 Architects', desc: t?.userWeb3Desc || 'Save critical research and thoughts directly to the decentralized web using the permanent IPFS gateway.' },
                    { icon: <Layout className="w-6 h-6" />, title: t?.userNomadTitle || 'Digital Nomads', desc: t?.userNomadDesc || 'Organize your entire writing life in a clean, folder-based drive with browser-like tabs that persist across all devices.' },
                    { icon: <PenTool className="w-6 h-6" />, title: t?.userCreativeTitle || 'Creative Minds', desc: t?.userCreativeDesc || 'Fuse technical writing with hand-drawn sketches and rich media to build documents that are truly multi-dimensional.' },
                    { icon: <Sparkles className="w-6 h-6" />, title: t?.userMinimalistTitle || 'Minimalists', desc: t?.userMinimalistDesc || 'Quickly jot down inspirations in a friction-free environment that values your focus more than your credentials.' },
                    { icon: <Users className="w-6 h-6" />, title: t?.userPublicTitle || 'Public Thinkers', desc: t?.userPublicDesc || 'Publish your inner work to a custom subdomain blog and build a public presence on your own terms.' },
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
                  {t?.homeFaqTitle || 'Questions & Answers'}
                </h2>
                <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
                  {[
                    { q: t?.faqQ1 || 'What makes Textpad different?', a: t?.faqA1 || 'Unlike standard notepads, Textpad combines a high-end visual editor with decentralized storage (IPFS) and professional publishing tools. It is built for permanence and creative freedom.' },
                    { q: t?.faqQ2 || 'Is it really decentralized?', a: t?.faqA2 || 'Yes. When you choose to save via IPFS, your document is cast to the permanent web. This ensures your content remains accessible even if central servers go down.' },
                    { q: t?.faqQ3 || 'Can I use it as a blog?', a: t?.faqA3 || 'Absolutely. You can turn any note into a professional blog post on a custom subdomain (e.g., yourname.textpad.cloud) with one click.' },
                    { q: t?.faqQ4 || 'How does link-based privacy work?', a: t?.faqA4 || 'Until you choose to publish, documents are private by default and only accessible via unique, obfuscated links. We do not index your private drafts.' },
                    { q: t?.faqQ5 || 'Is there a limit to what I can store?', a: t?.faqA5 || 'Local storage and standard cloud saving are unlimited for text. For heavy media and permanence, our IPFS integration provides a robust way to manage larger creative works.' },
                    { q: t?.faqQ6 || 'Why use Textpad?', a: t?.faqA6 || 'Textpad is designed to be a versatile online text editor for everything from quick jotting to professional writing. Whether you need a simple online notepad or a permanent digital archive, Textpad scales with your ideas.' },
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

              {/* Final CTA */}
              <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-cyan-50/30 rounded-[4rem] border border-gray-100 max-w-6xl mx-auto px-4">
                <h2 className="text-4xl md:text-5xl font-medium text-gray-900 mb-6 tracking-tight">
                  {t?.homeReadyTitle || 'Ready to write for the permanent web?'}
                </h2>
                <p className="text-gray-500 text-lg mb-10 font-normal">{t?.homeReadySubtitle || 'Start your creative journey on Textpad today.'}</p>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                    editorRef.current?.focus()
                  }}
                  className="px-12 py-5 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 active:scale-95 transition-all text-xl shadow-xl hover:shadow-cyan-100"
                >
                  {t?.homeCreateNote || 'Create Your First Note'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
