'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import NextLink from 'next/link'
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
import { FontSize } from '@/lib/editor/font-size-extension'
import { LineHeight } from '@/lib/editor/line-height-extension'
import { ResizableImage } from '@/lib/editor/resizable-image-extension'
import { Drawing } from '@/lib/editor/drawing-extension'
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
  const [isFullWidth, setIsFullWidth] = useState(false)
  const [navigation, setNavigation] = useState({ prev: null, next: null })
  
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
      FontSize,
      LineHeight,
      Drawing,
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
            setError('Document not found')
            setLoading(false)
            return
          }
          if (response.status === 403) {
            setError('This document is not public')
            setLoading(false)
            return
          }
          setError('Failed to load document')
          setLoading(false)
          return
        }
        
        const data = await response.json()
        const { document, content, navigation: nav } = data
        
        setTitle(document.title || 'Untitled')
        setIsFullWidth(document.is_full_width || false)
        setNavigation(nav || { prev: null, next: null })
        
        // Set editor content - wrap in queueMicrotask to avoid flushSync error
        if (editor && content) {
          queueMicrotask(() => {
            requestAnimationFrame(() => {
              try {
                editor.commands.setContent(content)
              } catch (error) {
                console.error('Error setting editor content:', error)
                try {
                  editor.commands.setContent({ type: 'doc', content: [] })
                } catch (fallbackError) {
                  console.error('Error setting fallback content:', fallbackError)
                }
              }
            })
          })
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
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {error === 'Document not found' ? 'Document Not Found' : 'Access Denied'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error === 'Document not found' 
                ? 'The document you are looking for does not exist or has been deleted.'
                : error === 'This document is not public'
                ? 'This document is private and cannot be accessed publicly.'
                : error}
            </p>
            <a
              href="/"
              className="inline-block px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className={isFullWidth ? 'px-4 sm:px-6 py-12' : 'max-w-4xl mx-auto px-6 py-12'}>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{title}</h1>
        <div className="max-w-none">
          <EditorContent editor={editor} />
        </div>
        
        {/* Navigation between public documents */}
        {(navigation.prev || navigation.next) && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {navigation.prev ? (
                <NextLink 
                  href={`/public/doc/${navigation.prev.id}`}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-gray-400">Previous</div>
                    <div className="text-sm font-medium truncate max-w-[200px]">{navigation.prev.title || 'Untitled'}</div>
                  </div>
                </NextLink>
              ) : <div />}
              
              {navigation.next ? (
                <NextLink 
                  href={`/public/doc/${navigation.next.id}`}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                >
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Next</div>
                    <div className="text-sm font-medium truncate max-w-[200px]">{navigation.next.title || 'Untitled'}</div>
                  </div>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </NextLink>
              ) : <div />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}




