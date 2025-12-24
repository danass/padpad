'use client'

import { useState, useEffect, useRef } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function ImageMenu({ node, updateAttributes, deleteNode, editor, getPos }) {
  const { t } = useLanguage()
  const [showMenu, setShowMenu] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState(null)
  const imageRef = useRef(null)
  const menuRef = useRef(null)

  const { src, alt, width, height, align } = node.attrs

  // Debug: log image attributes
  useEffect(() => {
    console.log('ImageMenu rendered with:', { src, alt, width, height, align })
  }, [src, alt, width, height, align])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          imageRef.current && !imageRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleImageClick = (e) => {
    e.stopPropagation()
    setShowMenu(true)
  }

  const handleResize = (size) => {
    if (!imageRef.current) return
    
    const img = new Image()
    img.onload = () => {
      const aspectRatio = img.width / img.height
      let newWidth, newHeight
      
      if (size === 'small') {
        newWidth = Math.min(200, img.width * 0.25)
      } else if (size === 'medium') {
        newWidth = Math.min(400, img.width * 0.5)
      } else if (size === 'large') {
        newWidth = Math.min(600, img.width * 0.75)
      } else {
        newWidth = null
        newHeight = null
      }
      
      if (newWidth) {
        newHeight = newWidth / aspectRatio
      }
      
      updateAttributes({ width: newWidth, height: newHeight })
    }
    img.src = src
  }

  const handleAlign = (alignment) => {
    updateAttributes({ align: alignment })
    setShowMenu(false)
  }

  const handleDelete = () => {
    deleteNode()
  }

  const handleDuplicate = () => {
    const pos = getPos()
    if (typeof pos === 'number') {
      editor.chain()
        .focus()
        .insertContentAt(pos + node.nodeSize, {
          type: 'image',
          attrs: { src, alt, width, height, align },
        })
        .run()
    }
    setShowMenu(false)
  }

  const handleTurnInto = (type) => {
    const pos = getPos()
    if (typeof pos === 'number') {
      editor.commands.setTextSelection(pos)
      if (type === 'paragraph') {
        editor.chain().focus().setNodeSelection(pos).clearNodes().setParagraph().run()
      } else if (type.startsWith('heading')) {
        const level = parseInt(type.replace('heading', ''))
        editor.chain().focus().setNodeSelection(pos).clearNodes().toggleHeading({ level }).run()
      }
    }
    setShowMenu(false)
  }

  const imageStyle = {
    maxWidth: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto',
    display: 'block',
    margin: align === 'left' ? '0 auto 0 0' : align === 'right' ? '0 0 0 auto' : '0 auto',
    cursor: 'pointer',
  }

  if (!src) {
    return (
      <NodeViewWrapper className="image-wrapper">
        <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
          {t?.noImageSource || 'No image source'}
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="image-wrapper" data-type="image">
      <div className="relative inline-block w-full" style={{ textAlign: align || 'center' }}>
        <img
          ref={imageRef}
          src={src}
          alt={alt || ''}
          style={imageStyle}
          onClick={handleImageClick}
          className="rounded-lg max-w-full h-auto"
          draggable={false}
          onError={(e) => {
            console.error('Image failed to load:', src)
            e.target.style.display = 'none'
          }}
        />
        
        {showMenu && (
          <div
            ref={menuRef}
            className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-2 min-w-[200px]"
            style={{
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
            }}
          >
            <div className="mb-2">
              <div className="text-xs font-semibold text-gray-500 mb-1 px-2">{t?.size || 'Size'}</div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleResize('small')}
                  className="px-2 py-1 text-xs rounded hover:bg-gray-100"
                >
                  S
                </button>
                <button
                  onClick={() => handleResize('medium')}
                  className="px-2 py-1 text-xs rounded hover:bg-gray-100"
                >
                  M
                </button>
                <button
                  onClick={() => handleResize('large')}
                  className="px-2 py-1 text-xs rounded hover:bg-gray-100"
                >
                  L
                </button>
                <button
                  onClick={() => handleResize('full')}
                  className="px-2 py-1 text-xs rounded hover:bg-gray-100"
                >
                  {t?.full || 'Full'}
                </button>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="text-xs font-semibold text-gray-500 mb-1 px-2">{t?.align || 'Align'}</div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleAlign('left')}
                  className={`px-2 py-1 text-xs rounded ${
                    align === 'left' ? 'bg-gray-100' : 'hover:bg-gray-100'
                  }`}
                >
                  ←
                </button>
                <button
                  onClick={() => handleAlign('center')}
                  className={`px-2 py-1 text-xs rounded ${
                    align === 'center' ? 'bg-gray-100' : 'hover:bg-gray-100'
                  }`}
                >
                  ↕
                </button>
                <button
                  onClick={() => handleAlign('right')}
                  className={`px-2 py-1 text-xs rounded ${
                    align === 'right' ? 'bg-gray-100' : 'hover:bg-gray-100'
                  }`}
                >
                  →
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-200 my-2"></div>
            
            <button
              onClick={handleDuplicate}
              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100"
            >
              {t?.duplicate || 'Duplicate'}
            </button>
            <button
              onClick={handleDelete}
              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 text-red-600"
            >
              {t?.delete || 'Delete'}
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

