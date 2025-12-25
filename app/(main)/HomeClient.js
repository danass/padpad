'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import SEOKeywords from '@/components/SEOKeywords'
import GoogleDocsToolbar from '@/components/editor/GoogleDocsToolbar'
import ContextMenu from '@/components/editor/ContextMenu'
import LinkEditor from '@/components/editor/LinkEditor'
import FeaturedArticlesClient from '@/components/home/FeaturedArticlesClient'
import { useLanguage } from '@/app/i18n/LanguageContext'
import { useEditor, EditorContent } from '@tiptap/react'
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

const STORAGE_KEY = 'textpad_cloud_unsaved_pad'
const STORAGE_TIMESTAMP_KEY = 'textpad_cloud_unsaved_pad_timestamp'
const STORAGE_PENDING_SAVE_KEY = 'textpad_cloud_pending_save'
const EXPIRY_HOURS = 48

export default function HomeClient({ featuredArticles = [] }) {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const { t } = useLanguage()
  const [saving, setSaving] = useState(false)
  const [showWatermark, setShowWatermark] = useState(true)
  const [hasEverHadContent, setHasEverHadContent] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [linkEditorPosition, setLinkEditorPosition] = useState(null)
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: 'Start typing... Create your document here',
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
          class: 'text-blue-500 underline cursor-pointer',
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
    ],
    content: null,
    editable: true,
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
  })

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
      // Show watermark only if no content AND never had content
      setShowWatermark(!hasContent && !hasEverHadContent)
    }

    const handleFocus = () => {
      setShowWatermark(false)
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
        setShowWatermark(true)
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
    if (!session) {
      // Save content to localStorage with pending save flag
      if (editor) {
        const content = editor.getJSON()
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
          localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString())
          localStorage.setItem(STORAGE_PENDING_SAVE_KEY, 'true')
        } catch (err) {
          console.error('Error saving to localStorage:', err)
        }
      }
      // Redirect to signin with callback to root to create document after login
      router.push('/auth/signin?callbackUrl=/')
      return
    }

    if (!editor) return

    setSaving(true)
    try {
      const content = editor.getJSON()
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

  // Check for pending save after login
  useEffect(() => {
    if (session && editor && !saving) {
      const pendingSave = localStorage.getItem(STORAGE_PENDING_SAVE_KEY)
      if (pendingSave === 'true') {
        // Wait a bit to ensure editor is ready
        const timer = setTimeout(() => {
          const saved = localStorage.getItem(STORAGE_KEY)
          if (saved) {
            try {
              const content = JSON.parse(saved)
              // Only create if there's actual content
              if (content && (content.content?.length > 0 || editor.getText().trim())) {
                setSaving(true)
                // Create document automatically
                fetch('/api/documents', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: 'Untitled',
                    folder_id: null,
                    content: content
                  }),
                })
                  .then(response => response.json())
                  .then(data => {
                    if (data.document) {
                      // Clear localStorage
                      localStorage.removeItem(STORAGE_KEY)
                      localStorage.removeItem(STORAGE_TIMESTAMP_KEY)
                      localStorage.removeItem(STORAGE_PENDING_SAVE_KEY)
                      // Navigate to the new document
                      router.push(`/doc/${data.document.id}`)
                    } else {
                      setSaving(false)
                    }
                  })
                  .catch(error => {
                    console.error('Error creating document:', error)
                    localStorage.removeItem(STORAGE_PENDING_SAVE_KEY)
                    setSaving(false)
                  })
              } else {
                localStorage.removeItem(STORAGE_PENDING_SAVE_KEY)
              }
            } catch (error) {
              console.error('Error parsing saved content:', error)
              localStorage.removeItem(STORAGE_PENDING_SAVE_KEY)
            }
          } else {
            localStorage.removeItem(STORAGE_PENDING_SAVE_KEY)
          }
        }, 500)

        return () => clearTimeout(timer)
      }
    }
  }, [session, editor, router, saving])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const keywords = 'textpad online, online text editor, free online notepad, plain text editor, browser text editor, simple text editor online, write text online, edit text online, no signup text editor, quick text editor online, notepad, bloc note, bloc note en ligne, bloc notes, note pad, online notepad, free notepad, bloc-notes en ligne, bloc-notes, blocnote, blocnote en ligne, cuaderno de notas, bloc de notas, bloc de notas en línea, cuaderno de notas en línea, блокнот, блокнот онлайн, онлайн блокнот, 记事本, 在线记事本, 记事本在线'

  return (
    <>
      <SEOKeywords keywords={keywords} />
      <main className="min-h-screen bg-white">
        <h1 className="absolute opacity-0 pointer-events-none">Online Text Editor, Instantly Shareable</h1>
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="mb-4 md:mb-6 flex items-center justify-end">
            <button
              onClick={handleSave}
              disabled={saving || !editor || (() => {
                const json = editor.getJSON()
                const hasText = editor.getText().trim().length > 0
                const hasContent = json?.content && Array.isArray(json.content) && json.content.length > 0
                return !hasText && !hasContent
              })()}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors fixed bottom-4 right-4 z-50 shadow-lg md:static md:shadow-none"
            >
              {saving ? (t?.saving || 'Saving...') : session ? (t?.saveDocument || 'Save Document') : (t?.save || 'Save')}
            </button>
          </div>

          {editor && (
            <>
              <div className="mb-4">
                <GoogleDocsToolbar editor={editor} />
              </div>
              <div className="prose max-w-none min-h-[200px] md:min-h-[500px] p-4 md:p-8 border border-gray-200 rounded-md focus-within:ring-2 focus-within:ring-black focus-within:border-black transition-all pb-20 md:pb-8 relative">
                {/* Watermark logo - only for non-logged users */}
                {!session && (
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500"
                    style={{ opacity: showWatermark ? 0.08 : 0 }}
                  >
                    <img
                      src="/padpad.svg"
                      fetchPriority="high"
                      // alt="textpad watermark" 
                      className="w-64 h-64 md:w-96 md:h-96 object-contain"
                    />
                  </div>
                )}
                {mounted && <EditorContent editor={editor} />}
                <ContextMenu editor={editor} />
                {linkEditorPosition && (
                  <LinkEditor
                    editor={editor}
                    position={linkEditorPosition}
                    onClose={() => setLinkEditorPosition(null)}
                  />
                )}
              </div>
              <p className="mt-4 text-xs text-gray-500 text-center">
                {session
                  ? (t?.savedLocally || 'Your document is saved locally. Click "Save Document" to save it permanently.')
                  : (t?.clickToSave || 'Click "Save" to sign in and save your document permanently.')}
              </p>
            </>
          )}

          {/* Featured Articles */}
          <FeaturedArticlesClient articles={featuredArticles} />
        </div>
      </main>
    </>
  )
}
