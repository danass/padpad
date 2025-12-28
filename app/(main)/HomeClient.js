'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, HardDrive, Youtube as YoutubeIcon, Code, Link as LinkIcon, Sparkles, Cloud, Share2, Smartphone, Palette, FileText, History, Shield, GraduationCap, Briefcase, PenTool, Users, Layout, ChevronDown } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import SEOKeywords from '@/components/SEOKeywords'
import GoogleDocsToolbar from '@/components/editor/GoogleDocsToolbar'
import ContextMenu from '@/components/editor/ContextMenu'
import LinkEditor from '@/components/editor/LinkEditor'
import IpfsBrowser from '@/components/ipfs/IpfsBrowser'
import BubbleToolbar from '@/components/editor/BubbleToolbar'
import FloatingToolbar from '@/components/editor/FloatingToolbar'
import { useLanguage } from '@/app/i18n/LanguageContext'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import CodeBlock from '@tiptap/extension-code-block'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Typography from '@tiptap/extension-typography'
import FontFamily from '@tiptap/extension-font-family'
import Emoji from '@tiptap/extension-emoji'
import { ResizableImage } from '@/lib/editor/resizable-image-extension'
import { Drawing } from '@/lib/editor/drawing-extension'
import { Youtube } from '@/lib/editor/youtube-extension'
import { TaskList, TaskItem } from '@/lib/editor/task-list-extension'
import { Details, DetailsSummary, DetailsContent } from '@/lib/editor/details-extension'
import { FontSize } from '@/lib/editor/font-size-extension'
import { LineHeight } from '@/lib/editor/line-height-extension'
import { LinkPreview } from '@/lib/editor/link-preview-extension'
import { Video } from '@/lib/editor/video-extension'
import { Audio } from '@/lib/editor/audio-extension'
import FileHandler from '@tiptap/extension-file-handler'
import Dropcursor from '@tiptap/extension-dropcursor'

const STORAGE_KEY = 'textpad_cloud_unsaved_pad'
const STORAGE_TIMESTAMP_KEY = 'textpad_cloud_unsaved_pad_timestamp'
const STORAGE_PENDING_SAVE_KEY = 'textpad_cloud_pending_save'
const EXPIRY_HOURS = 48

export default function HomeClient({ featuredArticles = [] }) {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const { t } = useLanguage()
  const [saving, setSaving] = useState(false)
  const [hasEverHadContent, setHasEverHadContent] = useState(false)
  const [hasContent, setHasContent] = useState(false) // Track if there's content to save
  const [mounted, setMounted] = useState(false)
  const [linkEditorPosition, setLinkEditorPosition] = useState(null)
  const [linkEditorMode, setLinkEditorMode] = useState(null)
  const [showIpfsBrowser, setShowIpfsBrowser] = useState(false)
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        dropcursor: false,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return t?.editorPlaceholderTitle || 'Title'
          }
          return t?.editorPlaceholder || 'Tell your story...'
        },
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-cyan-600 underline cursor-pointer',
        },
      }),
      Underline,
      Subscript,
      Superscript,
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 rounded-md p-4 font-mono text-sm',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Typography,
      FontFamily,
      FontSize,
      LineHeight,
      Emoji.configure({
        enableEmoticons: true,
      }),
      Youtube.configure({
        width: 640,
        height: 480,
        controls: true,
        nocookie: false,
      }),
      TaskList,
      TaskItem,
      Drawing,
      Details,
      DetailsSummary,
      DetailsContent,
      LinkPreview,
      Video,
      Audio,
      Dropcursor.configure({
        color: '#3b82f6',
        width: 2,
      }),
      FileHandler.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        onDrop: (currentEditor, files, pos) => {
          files.forEach(file => {
            const fileReader = new FileReader()
            fileReader.readAsDataURL(file)
            fileReader.onload = () => {
              currentEditor.chain().insertContentAt(pos, {
                type: 'image',
                attrs: { src: fileReader.result, alt: file.name },
              }).focus().run()
            }
          })
        },
        onPaste: (currentEditor, files, htmlContent) => {
          files.forEach(file => {
            if (file.type.startsWith('image/')) {
              const fileReader = new FileReader()
              fileReader.readAsDataURL(file)
              fileReader.onload = () => {
                currentEditor.chain().insertContent({
                  type: 'image',
                  attrs: { src: fileReader.result, alt: file.name },
                }).focus().run()
              }
            }
          })
        },
      }),
    ],
    content: null,
    editable: true,
    autofocus: 'end',
    onUpdate: ({ editor }) => {
      // Save to localStorage on every update
      const content = editor.getJSON()
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
        localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString())
      } catch (err) {
        console.error('Error saving to localStorage:', err)
      }
    },
  }, [t]) // Re-run when translations change

  // Track if editor has content for save button state
  useEffect(() => {
    if (!editor) return

    const checkEditorContent = () => {
      const text = editor.getText().trim()
      const json = editor.getJSON()
      const hasText = text.length > 0

      // Check for images or other non-empty nodes
      let hasImages = false
      let hasOtherContent = false
      if (json?.content && Array.isArray(json.content)) {
        json.content.forEach(node => {
          if (node.type === 'image') {
            hasImages = true
          } else if (node.type !== 'paragraph' || (node.content && node.content.length > 0 && node.content.some(n => n.type !== 'hardBreak' && (n.text || n.type === 'image')))) {
            hasOtherContent = true
          }
        })
      }

      setHasContent(hasText || hasImages || hasOtherContent)
    }

    // Check immediately and on updates
    checkEditorContent()
    editor.on('update', checkEditorContent)

    return () => {
      editor.off('update', checkEditorContent)
    }
  }, [editor])

  // Check if editor is empty to show/hide watermark (only for non-logged users on home page)
  useEffect(() => {
    if (!editor || session) return // Only show watermark when not logged in

    const checkContent = () => {
      // Check if editor has real content (text or images)
      const text = editor.getText().trim()
      const json = editor.getJSON()
      const hasText = text.length > 0

      // Check for images or other non-empty nodes
      let hasImages = false
      let hasOtherContent = false
      if (json?.content && Array.isArray(json.content)) {
        json.content.forEach(node => {
          if (node.type === 'image') {
            hasImages = true
          } else if (node.type !== 'paragraph' || (node.content && node.content.length > 0 && node.content.some(n => n.type !== 'hardBreak' && (n.text || n.type === 'image')))) {
            hasOtherContent = true
          }
        })
      }

      const hasContent = hasText || hasImages || hasOtherContent

      if (hasContent) {
        setHasEverHadContent(true)
      }
    }

    const handleFocus = () => {
    }

    const handleBlur = () => {
      // Only show watermark again if no content and never had content
      const text = editor.getText().trim()
      const json = editor.getJSON()
      const hasText = text.length > 0

      let hasImages = false
      let hasOtherContent = false
      if (json?.content && Array.isArray(json.content)) {
        json.content.forEach(node => {
          if (node.type === 'image') {
            hasImages = true
          } else if (node.type !== 'paragraph' || (node.content && node.content.length > 0 && node.content.some(n => n.type !== 'hardBreak' && (n.text || n.type === 'image')))) {
            hasOtherContent = true
          }
        })
      }

      const hasContent = hasText || hasImages || hasOtherContent
      if (!hasContent && !hasEverHadContent) {
      }
    }

    // Check immediately on mount and after a short delay to ensure editor is ready
    checkContent()
    const timeoutId = setTimeout(() => {
      checkContent()
    }, 200)

    editor.on('update', checkContent)
    editor.on('focus', handleFocus)
    editor.on('blur', handleBlur)

    return () => {
      clearTimeout(timeoutId)
      editor.off('update', checkContent)
      editor.off('focus', handleFocus)
      editor.off('blur', handleBlur)
    }
  }, [editor, session, hasEverHadContent])

  // Load from localStorage on mount
  useEffect(() => {
    if (!editor) return

    // Don't load if we have a pending save (will be handled by the save effect)
    const pendingSave = localStorage.getItem(STORAGE_PENDING_SAVE_KEY)
    if (pendingSave === 'true') {
      return
    }

    // Wait for editor to be fully ready before loading content
    const loadContent = () => {
      try {
        const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY)
        if (timestamp) {
          const age = (Date.now() - parseInt(timestamp, 10)) / (1000 * 60 * 60) // hours
          if (age > EXPIRY_HOURS) {
            // Expired - clear it
            localStorage.removeItem(STORAGE_KEY)
            localStorage.removeItem(STORAGE_TIMESTAMP_KEY)
            return
          }
        }

        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const content = JSON.parse(saved)
          // Check if content is actually empty (just empty paragraphs)
          const hasRealContent = content?.content && Array.isArray(content.content) && content.content.some(node => {
            if (node.type === 'image') return true
            if (node.type !== 'paragraph') return true
            if (node.content && Array.isArray(node.content)) {
              return node.content.some(n => n.type === 'image' || (n.text && n.text.trim().length > 0))
            }
            return false
          })

          // Only load if there's real content
          if (hasRealContent) {
            // Use multiple layers of async to avoid flushSync error
            setTimeout(() => {
              requestAnimationFrame(() => {
                queueMicrotask(() => {
                  if (editor && !editor.isDestroyed) {
                    try {
                      editor.commands.setContent(content)
                    } catch (err) {
                      console.error('Error setting content:', err)
                    }
                  }
                })
              })
            }, 100)
          } else {
            // Clear empty content from localStorage
            localStorage.removeItem(STORAGE_KEY)
            localStorage.removeItem(STORAGE_TIMESTAMP_KEY)
          }
        }
      } catch (err) {
        console.error('Error loading from localStorage:', err)
      }
    }

    // Wait a bit for editor to be ready
    const timer = setTimeout(loadContent, 200)
    return () => clearTimeout(timer)
  }, [editor])

  // Set mounted state to prevent flushSync errors during hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Listen for showLinkEditor event from toolbar
  useEffect(() => {
    const handleShowLinkEditor = (e) => {
      setLinkEditorPosition(e.detail.position)
      setLinkEditorMode(e.detail.mode || 'link')
    }

    window.addEventListener('showLinkEditor', handleShowLinkEditor)
    return () => {
      window.removeEventListener('showLinkEditor', handleShowLinkEditor)
    }
  }, [])

  // Clear localStorage when browser is closed (using beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Mark that we're closing - the content will be cleared on next visit if > 48h
      localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString())
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const handleSave = async () => {
    if (!editor) return

    setSaving(true)
    try {
      const content = editor.getJSON()

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
          // Clear localStorage
          localStorage.removeItem(STORAGE_KEY)
          localStorage.removeItem(STORAGE_TIMESTAMP_KEY)
          localStorage.removeItem(STORAGE_PENDING_SAVE_KEY)
          // Navigate to the temporary pad page
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
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(STORAGE_TIMESTAMP_KEY)
        localStorage.removeItem(STORAGE_PENDING_SAVE_KEY)
        // Navigate to the new document
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

  // Check for pending save after login (Legacy - replaced by Disposable Pads)
  // This is now handled by the Claim button on the temp page

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

          {editor && (
            <>
              <div className="mb-4">
                <GoogleDocsToolbar editor={editor} onOpenIpfsBrowser={() => setShowIpfsBrowser(true)} onSave={handleSave} saving={saving} hasChanges={hasContent} />
              </div>
              <div
                className="prose max-w-none min-h-[70vh] md:min-h-[500px] p-4 md:p-0 transition-all pb-24 md:pb-8 relative font-['DM_Sans',sans-serif]"
                onClick={(e) => {
                  // Only handle clicks directly on the prose container (empty space below content)
                  if (e.target === e.currentTarget && editor) {
                    const { state } = editor
                    const { doc } = state
                    const lastNode = doc.lastChild

                    // If there's already an empty paragraph at the end, just focus it
                    if (lastNode?.type.name === 'paragraph' && lastNode.content.size === 0) {
                      editor.chain().focus('end').run()
                    } else {
                      // Insert a new paragraph at the END of the document (not replacing selection)
                      const endPos = doc.content.size
                      editor.chain()
                        .insertContentAt(endPos, { type: 'paragraph' })
                        .focus('end')
                        .run()
                    }
                  }
                }}
              >
                {mounted && editor && (
                  <>
                    <BubbleMenu
                      editor={editor}
                      tippyOptions={{ duration: 100 }}
                      shouldShow={({ editor: bubbleEditor, state, from, to }) => {
                        // Never show on media nodes
                        if (bubbleEditor.isActive('linkPreview')) return false
                        if (bubbleEditor.isActive('resizableImage')) return false
                        if (bubbleEditor.isActive('video')) return false
                        if (bubbleEditor.isActive('youtube')) return false
                        if (bubbleEditor.isActive('drawing')) return false
                        if (bubbleEditor.isActive('audio')) return false

                        // Only show if there's a text selection
                        if (from === to) return false

                        // Check if it's a node selection
                        if (state.selection.node) return false

                        return true
                      }}
                    >
                      <BubbleToolbar
                        editor={editor}
                        onOpenLinkEditor={() => {
                          const { view } = editor
                          const { state } = view
                          const { selection } = state
                          const { from } = selection
                          const coords = view.coordsAtPos(from)
                          const container = view.dom.closest('.prose') || view.dom.parentElement
                          const containerRect = container?.getBoundingClientRect()

                          if (containerRect) {
                            setLinkEditorPosition({
                              top: coords.bottom - containerRect.top + 8,
                              left: coords.left - containerRect.left,
                            })
                          }
                        }}
                      />
                    </BubbleMenu>

                    <FloatingMenu
                      editor={editor}
                      tippyOptions={{ duration: 100 }}
                      shouldShow={({ state }) => {
                        const { selection } = state
                        const { $from } = selection
                        return $from.parent.content.size === 0
                      }}
                    >
                      <FloatingToolbar
                        editor={editor}
                        onOpenIpfsBrowser={() => setShowIpfsBrowser(true)}
                      />
                    </FloatingMenu>

                    <EditorContent editor={editor} />
                  </>
                )}
                <ContextMenu editor={editor} />
                {linkEditorPosition && (
                  <LinkEditor
                    editor={editor}
                    position={linkEditorPosition}
                    mode={linkEditorMode}
                    onClose={() => {
                      setLinkEditorPosition(null)
                      setLinkEditorMode(null)
                    }}
                  />
                )}
              </div>
              <div className="h-4" /> {/* Spacing */}
            </>
          )}

          {/* Landing Section - Only show when not logged in */}
          {!session && (
            <div className="mt-20 md:mt-32 space-y-24 md:space-y-40 pb-32 font-['DM_Sans',sans-serif]">
              {/* Hero tagline */}
              <div className="text-center max-w-4xl mx-auto px-4">
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

              {/* Effortless note-taking */}
              <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white rounded-3xl p-8 md:p-16 text-center border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles className="w-24 h-24 text-cyan-600" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-6 underline decoration-cyan-400 decoration-4 underline-offset-8">A legacy for the future</h2>
                  <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                    Textpad is built for permanence. Whether you're drafting a quick thought to IPFS or building a lifelong digital testament to be discovered by future generations, our tools ensure your words survive the test of time.
                  </p>
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                      editor?.chain().focus().run()
                    }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-medium rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg hover:shadow-cyan-200/50"
                  >
                    Start Your Legacy — No Sign-up Required
                  </button>
                </div>
              </div>

              {/* Who needs an online notepad */}
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
                  Ready to write for the permanent web?
                </h2>
                <p className="text-gray-500 text-lg mb-10">Start your creative journey on Textpad today.</p>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                    editor?.chain().focus().run()
                  }}
                  className="px-12 py-5 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 active:scale-95 transition-all text-xl shadow-xl hover:shadow-cyan-100"
                >
                  Create Your First Note
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* IPFS Browser Modal */}
      <IpfsBrowser
        isOpen={showIpfsBrowser}
        onClose={() => setShowIpfsBrowser(false)}
        onSelectFile={(file) => {
          if (!editor || !file.gatewayUrl) return

          // Determine file type and insert accordingly
          const ext = file.key.split('.').pop()?.toLowerCase()
          const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
          const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv']
          const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac']

          if (imageExts.includes(ext)) {
            // Insert as image
            editor.chain().focus().insertContent({
              type: 'image',
              attrs: { src: file.gatewayUrl, alt: file.key },
            }).run()
          } else if (videoExts.includes(ext)) {
            // Insert as video node
            editor.chain().focus().insertContent({
              type: 'video',
              attrs: { src: file.gatewayUrl, controls: true },
            }).run()
          } else if (audioExts.includes(ext)) {
            // Insert as audio node
            editor.chain().focus().insertContent({
              type: 'audio',
              attrs: { src: file.gatewayUrl, controls: true },
            }).run()
          } else {
            // Insert as link for other files
            editor.chain().focus().insertContent({
              type: 'text',
              marks: [{ type: 'link', attrs: { href: file.gatewayUrl } }],
              text: file.key,
            }).run()
          }

          setShowIpfsBrowser(false)
        }}
      />
    </>
  )
}
