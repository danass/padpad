'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
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
import { Youtube } from '@/lib/editor/youtube-extension'
import { TaskList, TaskItem } from '@/lib/editor/task-list-extension'
import { Details, DetailsSummary, DetailsContent } from '@/lib/editor/details-extension'
import GoogleDocsToolbar from '@/components/editor/GoogleDocsToolbar'

const STORAGE_KEY = 'textpad_cloud_unsaved_pad'
const STORAGE_TIMESTAMP_KEY = 'textpad_cloud_unsaved_pad_timestamp'
const STORAGE_PENDING_SAVE_KEY = 'textpad_cloud_pending_save'
const EXPIRY_HOURS = 48

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
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

  // Load from localStorage on mount
  useEffect(() => {
    if (!editor) return

    // Don't load if we have a pending save (will be handled by the save effect)
    const pendingSave = localStorage.getItem(STORAGE_PENDING_SAVE_KEY)
    if (pendingSave === 'true') {
      return
    }

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
        // Use queueMicrotask to avoid flushSync error
        queueMicrotask(() => {
          requestAnimationFrame(() => {
            editor.commands.setContent(content)
          })
        })
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err)
    }
  }, [editor])

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

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">textpad</h1>
            <p className="text-sm text-gray-600">Write, edit, and format your text instantly</p>
          </div>
          <div className="flex items-center gap-3">
            {session && (
              <NextLink
                href="/drive"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 text-sm font-medium transition-colors"
              >
                Go to Drive
              </NextLink>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !editor || !editor.getText().trim()}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors fixed bottom-4 right-4 z-50 shadow-lg md:static md:shadow-none"
            >
              {saving ? 'Saving...' : session ? 'Save Document' : (
                <>
                  <span className="md:hidden">Save</span>
                  <span className="hidden md:inline">Save or Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {editor && (
          <>
            <div className="mb-4 border-b border-gray-200">
              <GoogleDocsToolbar editor={editor} />
            </div>
            <div className="prose max-w-none min-h-[200px] md:min-h-[500px] p-4 md:p-8 border border-gray-200 rounded-md focus-within:ring-2 focus-within:ring-black focus-within:border-black transition-all pb-20 md:pb-8">
              <EditorContent editor={editor} />
            </div>
            <p className="mt-4 text-xs text-gray-500 text-center">
              {session 
                ? 'Your document is saved locally. Click "Save Document" to save it permanently.'
                : 'Click "Save or Share" to sign in and save your document permanently. Your work is saved locally for 48 hours.'}
            </p>
          </>
        )}
      </div>
    </main>
  )
}
