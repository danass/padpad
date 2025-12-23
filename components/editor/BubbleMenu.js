'use client'

import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react'
import { useState, useRef, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  Link, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  MoreHorizontal,
  Subscript,
  Superscript
} from 'lucide-react'
import TextStyleMenu from './TextStyleMenu'
import ColorPicker from './ColorPicker'

export default function BubbleMenu({ editor }) {
  if (!editor) {
    return null
  }

  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const instanceRef = useRef(null)
  
  // Patch tippy to prevent destroy warnings
  useEffect(() => {
    if (typeof window !== 'undefined' && window.tippy) {
      const originalDestroy = window.tippy.prototype.destroy
      window.tippy.prototype.destroy = function() {
        if (this.state && this.state.isDestroyed) {
          return // Already destroyed, skip
        }
        return originalDestroy.call(this)
      }
    }
  }, [])

  const handleTextColorChange = (color) => {
    editor.chain().focus().setColor(color).run()
  }

  const handleBackgroundColorChange = (color) => {
    editor.chain().focus().toggleHighlight({ color }).run()
  }

  return (
    <TiptapBubbleMenu
      editor={editor}
      tippyOptions={{ 
        duration: 100,
        maxWidth: 'none',
        placement: 'top',
        offset: [0, 8],
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
      className="bubble-menu"
    >
      <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-md shadow-lg px-1.5 py-1.5">
        {/* Text style dropdown */}
        <TextStyleMenu editor={editor} />

        <div className="w-px h-6 bg-gray-200 mx-0.5"></div>

        {/* Formatting buttons */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-md transition-all ${
              editor.isActive('bold')
                ? 'bg-gray-100 text-gray-900'
                : 'hover:bg-gray-100 text-gray-700'
            } active:scale-95`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-md transition-all ${
              editor.isActive('italic')
                ? 'bg-gray-100 text-gray-900'
                : 'hover:bg-gray-100 text-gray-700'
            } active:scale-95`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-md transition-all ${
              editor.isActive('underline')
                ? 'bg-gray-100 text-gray-900'
                : 'hover:bg-gray-100 text-gray-700'
            } active:scale-95`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-md transition-all ${
              editor.isActive('strike')
                ? 'bg-gray-100 text-gray-900'
                : 'hover:bg-gray-100 text-gray-700'
            } active:scale-95`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded-md transition-all ${
              editor.isActive('code')
                ? 'bg-gray-100 text-gray-900'
                : 'hover:bg-gray-100 text-gray-700'
            } active:scale-95`}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-0.5"></div>

        {/* Link button */}
        <button
          onClick={() => {
            const url = window.prompt('Enter URL:', editor.getAttributes('link')?.href || '')
            if (url) {
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              } else {
                editor.chain().focus().unsetLink().run()
              }
            }
          }}
          className={`p-1.5 rounded-md transition-all ${
            editor.isActive('link')
              ? 'bg-gray-100 text-gray-900'
              : 'hover:bg-gray-100 text-gray-700'
          } active:scale-95`}
          title="Link (Ctrl+K)"
        >
          <Link className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-0.5"></div>

        {/* Color pickers */}
        <ColorPicker
          currentColor={editor.getAttributes('textStyle').color}
          onColorChange={handleTextColorChange}
          type="text"
        />

        <ColorPicker
          currentColor={editor.getAttributes('highlight')?.color}
          onColorChange={handleBackgroundColorChange}
          type="background"
        />

        <div className="w-px h-6 bg-gray-200 mx-0.5"></div>

        {/* More options */}
        <div className="relative">
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className={`p-1.5 rounded-md transition-all ${
              showMoreOptions
                ? 'bg-gray-100'
                : 'hover:bg-gray-100'
            } text-gray-700 active:scale-95`}
            title="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMoreOptions && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowMoreOptions(false)}
              />
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px] py-1">
                <button
                  onClick={() => {
                    editor.chain().focus().toggleSubscript().run()
                    setShowMoreOptions(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                    editor.isActive('subscript')
                      ? 'bg-gray-100 text-gray-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Subscript className="w-4 h-4" />
                  <span>Subscript</span>
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().toggleSuperscript().run()
                    setShowMoreOptions(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                    editor.isActive('superscript')
                      ? 'bg-gray-100 text-gray-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Superscript className="w-4 h-4" />
                  <span>Superscript</span>
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => {
                    editor.chain().focus().setTextAlign('left').run()
                    setShowMoreOptions(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                    editor.isActive({ textAlign: 'left' })
                      ? 'bg-gray-100 text-gray-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                  <span>Align Left</span>
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().setTextAlign('center').run()
                    setShowMoreOptions(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                    editor.isActive({ textAlign: 'center' })
                      ? 'bg-gray-100 text-gray-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <AlignCenter className="w-4 h-4" />
                  <span>Align Center</span>
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().setTextAlign('right').run()
                    setShowMoreOptions(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                    editor.isActive({ textAlign: 'right' })
                      ? 'bg-gray-100 text-gray-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <AlignRight className="w-4 h-4" />
                  <span>Align Right</span>
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().setTextAlign('justify').run()
                    setShowMoreOptions(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                    editor.isActive({ textAlign: 'justify' })
                      ? 'bg-gray-100 text-gray-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <AlignJustify className="w-4 h-4" />
                  <span>Justify</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </TiptapBubbleMenu>
  )
}
