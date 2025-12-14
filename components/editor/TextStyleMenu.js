'use client'

import { useState } from 'react'
import { Type, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code2 } from 'lucide-react'

const textStyles = [
  { 
    label: 'Paragraph', 
    value: 'paragraph', 
    icon: Type,
    command: (editor) => editor.chain().focus().setParagraph().run() 
  },
  { 
    label: 'Heading 1', 
    value: 'heading1', 
    icon: Heading1,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run() 
  },
  { 
    label: 'Heading 2', 
    value: 'heading2', 
    icon: Heading2,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run() 
  },
  { 
    label: 'Heading 3', 
    value: 'heading3', 
    icon: Heading3,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run() 
  },
  { 
    label: 'Bullet List', 
    value: 'bulletList', 
    icon: List,
    command: (editor) => editor.chain().focus().toggleBulletList().run() 
  },
  { 
    label: 'Numbered List', 
    value: 'orderedList', 
    icon: ListOrdered,
    command: (editor) => editor.chain().focus().toggleOrderedList().run() 
  },
  { 
    label: 'Blockquote', 
    value: 'blockquote', 
    icon: Quote,
    command: (editor) => editor.chain().focus().toggleBlockquote().run() 
  },
  { 
    label: 'Code Block', 
    value: 'codeBlock', 
    icon: Code2,
    command: (editor) => editor.chain().focus().toggleCodeBlock().run() 
  },
]

export default function TextStyleMenu({ editor, onClose }) {
  const [showMenu, setShowMenu] = useState(false)

  const getCurrentStyle = () => {
    if (editor.isActive('heading', { level: 1 })) return { label: 'Heading 1', icon: Heading1 }
    if (editor.isActive('heading', { level: 2 })) return { label: 'Heading 2', icon: Heading2 }
    if (editor.isActive('heading', { level: 3 })) return { label: 'Heading 3', icon: Heading3 }
    if (editor.isActive('bulletList')) return { label: 'Bullet List', icon: List }
    if (editor.isActive('orderedList')) return { label: 'Numbered List', icon: ListOrdered }
    if (editor.isActive('blockquote')) return { label: 'Blockquote', icon: Quote }
    if (editor.isActive('codeBlock')) return { label: 'Code Block', icon: Code2 }
    return { label: 'Text', icon: Type }
  }

  const currentStyle = getCurrentStyle()
  const Icon = currentStyle.icon

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-2.5 py-1.5 rounded-md text-sm font-medium transition-all hover:bg-gray-100 text-gray-700 flex items-center gap-1.5 active:scale-95"
        title="Text Style"
      >
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{currentStyle.label}</span>
        <span className="text-xs">▼</span>
      </button>
      
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px] py-1">
            {textStyles.map((style) => {
              const StyleIcon = style.icon
              const isActive = 
                (style.value === 'paragraph' && editor.isActive('paragraph')) ||
                (style.value === 'heading1' && editor.isActive('heading', { level: 1 })) ||
                (style.value === 'heading2' && editor.isActive('heading', { level: 2 })) ||
                (style.value === 'heading3' && editor.isActive('heading', { level: 3 })) ||
                (style.value === 'bulletList' && editor.isActive('bulletList')) ||
                (style.value === 'orderedList' && editor.isActive('orderedList')) ||
                (style.value === 'blockquote' && editor.isActive('blockquote')) ||
                (style.value === 'codeBlock' && editor.isActive('codeBlock'))
              
              return (
                <button
                  key={style.value}
                  onClick={() => {
                    style.command(editor)
                    setShowMenu(false)
                    if (onClose) onClose()
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <StyleIcon className="w-4 h-4" />
                  <span>{style.label}</span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
