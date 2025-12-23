'use client'

import { FloatingMenu as TiptapFloatingMenu } from '@tiptap/react'
import { useRef, useEffect } from 'react'

export default function FloatingMenu({ editor }) {
  if (!editor) {
    return null
  }

  const instanceRef = useRef(null)
  
  // Suppress tippy warnings in development
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const originalWarn = console.warn
      console.warn = (...args) => {
        // Filter out tippy.js warnings
        if (args[0] && typeof args[0] === 'string' && args[0].includes('tippy.js')) {
          return // Suppress tippy warnings
        }
        originalWarn.apply(console, args)
      }
      
      return () => {
        console.warn = originalWarn
      }
    }
  }, [])

  return (
    <TiptapFloatingMenu
      editor={editor}
      tippyOptions={{ 
        duration: 100,
        onDestroy: (instance) => {
          // Mark instance as destroyed to prevent warnings
          if (instance) {
            instance.destroyed = true
            instance.state = instance.state || {}
            instance.state.isDestroyed = true
            instanceRef.current = null
          }
        },
        onCreate: (instance) => {
          // Track instance
          instanceRef.current = instance
          if (instance) {
            instance.state = instance.state || {}
            instance.state.isDestroyed = false
          }
        },
        onHide: (instance) => {
          // Prevent hide() calls on destroyed instances
          if (instance && instance.destroyed) {
            return false
          }
        },
        onShow: (instance) => {
          // Prevent show() calls on destroyed instances
          if (instance && instance.destroyed) {
            return false
          }
        },
        onHidden: (instance) => {
          // Clean up after hide
          if (instance && instance.destroyed) {
            return false
          }
        }
      }}
      className="floating-menu"
    >
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md shadow-lg p-1">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="px-3 py-1.5 rounded text-sm font-medium transition-colors hover:bg-gray-100 text-gray-700"
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="px-3 py-1.5 rounded text-sm font-medium transition-colors hover:bg-gray-100 text-gray-700"
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="px-3 py-1.5 rounded text-sm font-medium transition-colors hover:bg-gray-100 text-gray-700"
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="px-3 py-1.5 rounded text-sm font-medium transition-colors hover:bg-gray-100 text-gray-700"
          title="Numbered List"
        >
          1.
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="px-3 py-1.5 rounded text-sm font-medium transition-colors hover:bg-gray-100 text-gray-700"
          title="Blockquote"
        >
          "
        </button>
      </div>
    </TiptapFloatingMenu>
  )
}




