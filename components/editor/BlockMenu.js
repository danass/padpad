'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowUp, ArrowDown, GripVertical, Trash2, Copy } from 'lucide-react'

export default function BlockMenu({ editor, blockPos, blockType, onClose }) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
        if (onClose) onClose()
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu, onClose])

  const handleMoveUp = () => {
    if (!editor || typeof blockPos !== 'number') return
    
    try {
      const { tr } = editor.state
      const $pos = tr.doc.resolve(blockPos)
      const node = $pos.node()
      
      if (blockPos > 0) {
        const prevPos = blockPos - 1
        const prevNode = tr.doc.nodeAt(prevPos)
        
        if (prevNode) {
          tr.delete(blockPos, blockPos + node.nodeSize)
          tr.insert(prevPos, node)
          editor.view.dispatch(tr)
        }
      }
    } catch (error) {
      console.error('Error moving block up:', error)
    }
    setShowMenu(false)
    if (onClose) onClose()
  }

  const handleMoveDown = () => {
    if (!editor || typeof blockPos !== 'number') return
    
    try {
      const { tr } = editor.state
      const $pos = tr.doc.resolve(blockPos)
      const node = $pos.node()
      const nextPos = blockPos + node.nodeSize
      
      if (nextPos < tr.doc.content.size) {
        const nextNode = tr.doc.nodeAt(nextPos)
        
        if (nextNode) {
          tr.delete(blockPos, blockPos + node.nodeSize)
          tr.insert(nextPos + nextNode.nodeSize, node)
          editor.view.dispatch(tr)
        }
      }
    } catch (error) {
      console.error('Error moving block down:', error)
    }
    setShowMenu(false)
    if (onClose) onClose()
  }

  const handleDelete = () => {
    if (!editor || typeof blockPos !== 'number') return
    
    try {
      const { tr } = editor.state
      const $pos = tr.doc.resolve(blockPos)
      const node = $pos.node()
      
      tr.delete(blockPos, blockPos + node.nodeSize)
      editor.view.dispatch(tr)
    } catch (error) {
      console.error('Error deleting block:', error)
    }
    setShowMenu(false)
    if (onClose) onClose()
  }

  const handleDuplicate = () => {
    if (!editor || typeof blockPos !== 'number') return
    
    try {
      const { tr } = editor.state
      const $pos = tr.doc.resolve(blockPos)
      const node = $pos.node()
      
      tr.insert(blockPos + node.nodeSize, node)
      editor.view.dispatch(tr)
    } catch (error) {
      console.error('Error duplicating block:', error)
    }
    setShowMenu(false)
    if (onClose) onClose()
  }

  return (
    <div
      ref={menuRef}
      className="absolute left-0 top-0 transform -translate-x-full mr-2 z-50 bg-white border border-gray-200 rounded-md shadow-lg p-1 flex flex-col gap-0.5"
      style={{
        opacity: showMenu ? 1 : 0,
        pointerEvents: showMenu ? 'auto' : 'none',
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => {
        setShowMenu(false)
        if (onClose) onClose()
      }}
    >
      <button
        onClick={handleMoveUp}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-700 transition-colors"
        title="Move up"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
      <button
        onClick={handleMoveDown}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-700 transition-colors"
        title="Move down"
      >
        <ArrowDown className="w-4 h-4" />
      </button>
      <div className="w-full h-px bg-gray-200 my-0.5"></div>
      <button
        onClick={handleDuplicate}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-700 transition-colors"
        title="Duplicate"
      >
        <Copy className="w-4 h-4" />
      </button>
      <button
        onClick={handleDelete}
        className="p-1.5 rounded hover:bg-gray-100 text-red-600 transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
