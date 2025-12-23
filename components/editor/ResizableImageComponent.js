'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { GripVertical, AlignLeft, AlignCenter, AlignRight, Trash2, Copy } from 'lucide-react'

export default function ResizableImageComponent({ node, updateAttributes, deleteNode, editor, getPos }) {
  const [isResizing, setIsResizing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const imageRef = useRef(null)
  const resizeHandleRef = useRef(null)
  const menuRef = useRef(null)

  const { src, alt, width, height, align } = node.attrs

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          imageRef.current && !imageRef.current.contains(event.target) &&
          resizeHandleRef.current && !resizeHandleRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  // Set default size to 1/3 of container width on load if not set
  useEffect(() => {
    if (!width && !height && imageRef.current && imageRef.current.complete && imageRef.current.naturalWidth > 0) {
      const containerWidth = imageRef.current.parentElement?.offsetWidth || 800
      const defaultWidth = Math.floor(containerWidth / 3)
      const aspectRatio = imageRef.current.naturalHeight / imageRef.current.naturalWidth
      const defaultHeight = Math.floor(defaultWidth * aspectRatio)
      // Defer updateAttributes to avoid flushSync during render
      queueMicrotask(() => {
        updateAttributes({ width: defaultWidth, height: defaultHeight })
      })
    }
  }, [src, width, height, updateAttributes])

  const handleMouseDown = useCallback((e) => {
    // Don't allow resizing if editor is not editable (public view)
    if (!editor.isEditable) return
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    const currentWidth = width || imageRef.current?.offsetWidth || 300
    setStartX(e.clientX)
    setStartWidth(currentWidth)
  }, [width, editor])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e) => {
      const diff = e.clientX - startX
      const newWidth = Math.max(100, Math.min(1200, startWidth + diff))
      const aspectRatio = height && width ? height / width : (imageRef.current?.naturalHeight || 1) / (imageRef.current?.naturalWidth || 1)
      const newHeight = newWidth * aspectRatio
      // Use requestAnimationFrame to batch updates during resize
      requestAnimationFrame(() => {
        updateAttributes({ width: newWidth, height: newHeight })
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, startX, startWidth, height, width, updateAttributes])

  const handleImageClick = (e) => {
    e.stopPropagation()
    // Don't show menu if editor is not editable (public view)
    if (!editor.isEditable) return
    setShowMenu(!showMenu)
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

  // Calculate aspect ratio to preserve image proportions
  const getAspectRatio = () => {
    if (imageRef.current?.naturalWidth && imageRef.current?.naturalHeight) {
      return imageRef.current.naturalHeight / imageRef.current.naturalWidth
    }
    if (height && width) {
      return height / width
    }
    return null
  }
  
  const aspectRatio = getAspectRatio()
  
  const imageStyle = {
    width: width ? `${width}px` : 'auto',
    height: width && aspectRatio ? `${width * aspectRatio}px` : (height ? `${height}px` : 'auto'),
    maxWidth: '100%',
    objectFit: 'contain', // Preserve aspect ratio
    display: 'block',
    margin: align === 'left' ? '0 auto 0 0' : align === 'right' ? '0 0 0 auto' : '0 auto',
    cursor: 'pointer',
    userSelect: 'none',
  }

  return (
    <NodeViewWrapper 
      className="resizable-image-wrapper" 
      data-drag-handle
      style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <div 
        className="relative inline-block group"
        style={{ 
          textAlign: align || 'center',
          width: '100%',
        }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt || ''}
          style={{
            ...imageStyle,
            cursor: editor.isEditable ? 'pointer' : 'default'
          }}
          onClick={handleImageClick}
          className="rounded-lg"
          draggable={false}
          onLoad={(e) => {
            // Set initial dimensions if not set, preserving aspect ratio
            if (!width && !height && e.target.naturalWidth && e.target.naturalWidth > 0) {
              const containerWidth = e.target.parentElement?.offsetWidth || 800
              const defaultWidth = Math.floor(containerWidth / 3)
              const aspectRatio = e.target.naturalHeight / e.target.naturalWidth
              const defaultHeight = Math.floor(defaultWidth * aspectRatio)
              // Defer updateAttributes to avoid flushSync during render
              queueMicrotask(() => {
                updateAttributes({ 
                  width: defaultWidth,
                  height: defaultHeight
                })
              })
            }
          }}
        />
        
        {/* Resize handle - only show if editor is editable */}
        {editor.isEditable && (
          <div
            ref={resizeHandleRef}
            onMouseDown={handleMouseDown}
            className={`absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-tl-lg cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity ${
              isResizing ? 'opacity-100' : ''
            }`}
          style={{
            transform: 'translate(50%, 50%)',
            zIndex: 10,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 border-2 border-white rounded-sm"></div>
          </div>
        </div>
        )}

        {/* Context menu - only show if editor is editable */}
        {editor.isEditable && showMenu && (
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
              <div className="text-xs font-semibold text-gray-500 mb-1 px-2">Align</div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleAlign('left')}
                  className={`p-2 rounded transition-colors ${
                    align === 'left'
                      ? 'bg-gray-100 text-gray-900'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAlign('center')}
                  className={`p-2 rounded transition-colors ${
                    align === 'center'
                      ? 'bg-gray-100 text-gray-900'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAlign('right')}
                  className={`p-2 rounded transition-colors ${
                    align === 'right'
                      ? 'bg-gray-100 text-gray-900'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 my-2"></div>

            <button
              onClick={handleDuplicate}
              className="w-full text-left px-3 py-2 text-sm rounded transition-colors hover:bg-gray-100 text-gray-700 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>Duplicate</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-full text-left px-3 py-2 text-sm rounded transition-colors hover:bg-gray-100 text-red-600 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}





