'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { EditorContent, useEditor } from '@tiptap/react'
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
import { ResizableImage } from '@/lib/editor/resizable-image-extension'
import { Youtube } from '@/lib/editor/youtube-extension'
import { TaskList, TaskItem } from '@/lib/editor/task-list-extension'
import { Details, DetailsSummary, DetailsContent } from '@/lib/editor/details-extension'
import Emoji from '@tiptap/extension-emoji'

export default function PublicDocumentPage() {
  const params = useParams()
  const documentId = params.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [title, setTitle] = useState('')
  
  const editor = useEditor({
    editable: false, // Read-only mode
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Placeholder.configure({
        placeholder: '',
      }),
      ResizableImage.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
      Youtube,
      TaskList,
      TaskItem,
      Details,
      DetailsSummary,
      DetailsContent,
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
    ],
  })
  
  useEffect(() => {
    async function loadDocument() {
      if (!documentId) return
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/public/documents/${documentId}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Document not found')
          }
          throw new Error('Failed to load document')
        }
        
        const data = await response.json()
        const { document, content } = data
        
        setTitle(document.title)
        
        // Set editor content
        if (editor && content) {
          try {
            editor.commands.setContent(content)
          } catch (error) {
            console.error('Error setting editor content:', error)
            editor.commands.setContent({ type: 'doc', content: [] })
          }
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Error loading document:', err)
        setError(err.message)
        setLoading(false)
      }
    }
    
    loadDocument()
  }, [documentId, editor])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <a
            href="/"
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{title || 'Untitled'}</h1>
        <div className="prose prose-lg max-w-none">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
