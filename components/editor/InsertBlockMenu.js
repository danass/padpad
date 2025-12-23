'use client'

import { useState, useEffect, useRef } from 'react'

const blockTypes = [
  { type: 'heading1', icon: '#', label: 'Headings' },
  { type: 'heading2', icon: '##', label: 'Headings' },
  { type: 'heading3', icon: '###', label: 'Headings' },
  { type: 'bulletList', icon: '-', label: 'Lists' },
  { type: 'orderedList', icon: '1.', label: 'Lists' },
  { type: 'blockquote', icon: '>', label: 'Quotes' },
  { type: 'codeBlock', icon: '`', label: 'Code' },
]

export default function InsertBlockMenu({ editor, position, onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % blockTypes.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + blockTypes.length) % blockTypes.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleSelect(blockTypes[selectedIndex])
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, onClose])

  const handleSelect = (blockType) => {
    if (!editor) return

    if (blockType.type === 'heading1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run()
    } else if (blockType.type === 'heading2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run()
    } else if (blockType.type === 'heading3') {
      editor.chain().focus().toggleHeading({ level: 3 }).run()
    } else if (blockType.type === 'bulletList') {
      editor.chain().focus().toggleBulletList().run()
    } else if (blockType.type === 'orderedList') {
      editor.chain().focus().toggleOrderedList().run()
    } else if (blockType.type === 'blockquote') {
      editor.chain().focus().toggleBlockquote().run()
    } else if (blockType.type === 'codeBlock') {
      editor.chain().focus().toggleCodeBlock().run()
    }

    onClose()
  }

  if (!position) return null

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-1 min-w-[200px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="px-2 py-1 text-xs font-semibold text-gray-500 mb-1">
        Insert block
      </div>
      {blockTypes.map((blockType, index) => (
        <button
          key={blockType.type}
          onClick={() => handleSelect(blockType)}
          className={`w-full text-left px-3 py-2 flex items-center gap-2 rounded transition-colors ${
            index === selectedIndex
              ? 'bg-gray-100'
              : 'hover:bg-gray-50'
          }`}
        >
          <span className="text-gray-400 font-mono text-sm">{blockType.icon}</span>
          <span className="text-sm text-gray-700">{blockType.label}</span>
        </button>
      ))}
    </div>
  )
}




