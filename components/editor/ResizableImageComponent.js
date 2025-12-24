'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function ResizableImageComponent({ node, updateAttributes, deleteNode, editor, getPos }) {
  const { t } = useLanguage()
  const [isResizing, setIsResizing] = useState(false)
  const [resizeCorner, setResizeCorner] = useState(null) // 'tl', 'tr', 'bl', 'br'
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const [startHeight, setStartHeight] = useState(0)
  const imageRef = useRef(null)
  const menuRef = useRef(null)
  const resizeHandleRefs = {
    tl: useRef(null),
    tr: useRef(null),
    bl: useRef(null),
    br: useRef(null),
  }

  const { src, alt, width, height, align } = node.attrs

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(e.target) && 
          imageRef.current && !imageRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleResizeStart = useCallback((e, corner) => {
    // Don't allow resizing if editor is not editable (public view)
    if (!editor.isEditable) return
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeCorner(corner)
    const currentWidth = width || imageRef.current?.offsetWidth || 300
    const currentHeight = height || imageRef.current?.offsetHeight || 200
    setStartX(e.touches ? e.touches[0].clientX : e.clientX)
    setStartY(e.touches ? e.touches[0].clientY : e.clientY)
    setStartWidth(currentWidth)
    setStartHeight(currentHeight)
  }, [width, height, editor])

  useEffect(() => {
    if (!isResizing || !resizeCorner) return

    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      
      const diffX = clientX - startX
      const diffY = clientY - startY
      
      // Calculate aspect ratio
      const aspectRatio = startHeight / startWidth
      
      let newWidth = startWidth
      let newHeight = startHeight
      
      // Calculate new dimensions based on corner
      if (resizeCorner === 'tr') {
        // Top-right: resize from top-right corner
        newWidth = Math.max(100, Math.min(1200, startWidth + diffX))
        newHeight = newWidth * aspectRatio
      } else if (resizeCorner === 'br') {
        // Bottom-right: resize from bottom-right corner
        newWidth = Math.max(100, Math.min(1200, startWidth + diffX))
        newHeight = newWidth * aspectRatio
      } else if (resizeCorner === 'tl') {
        // Top-left: resize from top-left corner
        newWidth = Math.max(100, Math.min(1200, startWidth - diffX))
        newHeight = newWidth * aspectRatio
      } else if (resizeCorner === 'bl') {
        // Bottom-left: resize from bottom-left corner
        newWidth = Math.max(100, Math.min(1200, startWidth - diffX))
        newHeight = newWidth * aspectRatio
      }
      
      // Use requestAnimationFrame to batch updates during resize
      requestAnimationFrame(() => {
        updateAttributes({ width: newWidth, height: newHeight })
      })
    }

    const handleEnd = () => {
      setIsResizing(false)
      setResizeCorner(null)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [isResizing, resizeCorner, startX, startY, startWidth, startHeight, updateAttributes])

  const handleImageClick = (e) => {
    if (!editor.isEditable) return
    e.stopPropagation()
    const rect = imageRef.current?.getBoundingClientRect()
    if (rect) {
      setMenuPosition({
        top: e.clientY,
        left: e.clientX
      })
      setShowMenu(true)
    }
  }

  const handleAlign = (alignment) => {
    updateAttributes({ align: alignment })
    setShowMenu(false)
  }

  const handleDelete = () => {
    deleteNode()
    setShowMenu(false)
  }
  
  const handleWidthPreset = (preset) => {
    if (!imageRef.current) return
    // Find the editor/prose container for accurate width
    const proseElement = imageRef.current.closest('.prose') || 
                         imageRef.current.closest('.ProseMirror') ||
                         imageRef.current.closest('[class*="editor"]')
    const containerWidth = proseElement?.offsetWidth || 800
    let newWidth
    switch (preset) {
      case '1/3': newWidth = Math.floor(containerWidth / 3); break
      case '2/3': newWidth = Math.floor(containerWidth * 2 / 3); break
      case 'full': newWidth = containerWidth - 32; break // Subtract padding
      default: return
    }
    const aspectRatio = (imageRef.current.naturalHeight || height) / (imageRef.current.naturalWidth || width || 1)
    const newHeight = Math.floor(newWidth * aspectRatio)
    updateAttributes({ width: newWidth, height: newHeight })
    setShowMenu(false)
  }
  
  // Determine which width preset is currently active
  const getActiveWidthPreset = () => {
    if (!imageRef.current || !width) return null
    const proseElement = imageRef.current.closest('.prose') || 
                         imageRef.current.closest('.ProseMirror') ||
                         imageRef.current.closest('[class*="editor"]')
    const containerWidth = proseElement?.offsetWidth || 800
    const tolerance = 20 // Allow some tolerance for rounding
    if (Math.abs(width - Math.floor(containerWidth / 3)) < tolerance) return '1/3'
    if (Math.abs(width - Math.floor(containerWidth * 2 / 3)) < tolerance) return '2/3'
    if (Math.abs(width - (containerWidth - 32)) < tolerance) return 'full'
    return null
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
        <div className="relative inline-block">
          <img
            ref={imageRef}
            src={src}
            alt={alt || ''}
            style={{
              ...imageStyle,
              cursor: editor.isEditable ? 'pointer' : 'default',
              touchAction: 'none'
            }}
            onClick={handleImageClick}
            className={`rounded-lg transition-all ${editor.isEditable ? 'group-hover:ring-2 group-hover:ring-blue-400' : ''}`}
            draggable={false}
            onTouchStart={(e) => {
              // Prevent scroll when touching image on mobile
              e.stopPropagation()
            }}
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
        {/* Corner indicators on hover */}
        {editor.isEditable && (
          <>
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-br-lg" />
          </>
        )}
        
        {/* Context menu */}
        {showMenu && editor.isEditable && (
          <div
            ref={menuRef}
            className="fixed z-[10005] bg-white border border-gray-200 rounded-md shadow-lg p-2 min-w-[150px]"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              transform: 'translate(-50%, 10px)',
            }}
          >
            <div className="text-xs font-semibold text-gray-500 mb-2 px-2">{t?.alignment || 'Alignment'}</div>
            <div className="flex gap-1 mb-2">
              <button
                onClick={() => handleAlign('left')}
                className={`p-2 rounded hover:bg-gray-100 ${align === 'left' ? 'bg-gray-200' : ''}`}
                title={t?.alignLeft || 'Align left'}
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAlign('center')}
                className={`p-2 rounded hover:bg-gray-100 ${align === 'center' || !align ? 'bg-gray-200' : ''}`}
                title={t?.alignCenter || 'Align center'}
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAlign('right')}
                className={`p-2 rounded hover:bg-gray-100 ${align === 'right' ? 'bg-gray-200' : ''}`}
                title={t?.alignRight || 'Align right'}
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="text-xs font-semibold text-gray-500 mb-2 px-2">{t?.widthLabel || 'Width'}</div>
            <div className="flex gap-1 mb-2">
              <button
                onClick={() => getActiveWidthPreset() !== '1/3' && handleWidthPreset('1/3')}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                  getActiveWidthPreset() === '1/3' 
                    ? 'bg-gray-200 border-gray-400 cursor-default' 
                    : 'hover:bg-gray-100 border-gray-200'
                }`}
                title={t?.oneThirdWidth || '1/3 of width'}
              >
                ⅓
              </button>
              <button
                onClick={() => getActiveWidthPreset() !== '2/3' && handleWidthPreset('2/3')}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                  getActiveWidthPreset() === '2/3' 
                    ? 'bg-gray-200 border-gray-400 cursor-default' 
                    : 'hover:bg-gray-100 border-gray-200'
                }`}
                title={t?.twoThirdsWidth || '2/3 of width'}
              >
                ⅔
              </button>
              <button
                onClick={() => getActiveWidthPreset() !== 'full' && handleWidthPreset('full')}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                  getActiveWidthPreset() === 'full' 
                    ? 'bg-gray-200 border-gray-400 cursor-default' 
                    : 'hover:bg-gray-100 border-gray-200'
                }`}
                title={t?.fullWidthLabel || 'Full width'}
              >
                100%
              </button>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {t?.delete || 'Delete'}
            </button>
          </div>
        )}
        
        {/* Resize handles on all 4 corners - only show if editor is editable */}
        {editor.isEditable && (
          <>
            {/* Top-left */}
            <div
              ref={resizeHandleRefs.tl}
              onMouseDown={(e) => handleResizeStart(e, 'tl')}
              onTouchStart={(e) => handleResizeStart(e, 'tl')}
              className={`absolute top-0 left-0 w-8 h-8 md:w-4 md:h-4 bg-blue-500 rounded-br-lg cursor-nwse-resize md:opacity-0 md:group-hover:opacity-100 transition-opacity ${
                isResizing && resizeCorner === 'tl' ? 'opacity-100' : 'opacity-100 md:opacity-0'
              }`}
              style={{
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                touchAction: 'none',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 md:w-1.5 md:h-1.5 border-2 border-white rounded-sm"></div>
              </div>
            </div>
            {/* Top-right */}
            <div
              ref={resizeHandleRefs.tr}
              onMouseDown={(e) => handleResizeStart(e, 'tr')}
              onTouchStart={(e) => handleResizeStart(e, 'tr')}
              className={`absolute top-0 right-0 w-8 h-8 md:w-4 md:h-4 bg-blue-500 rounded-bl-lg cursor-nesw-resize md:opacity-0 md:group-hover:opacity-100 transition-opacity ${
                isResizing && resizeCorner === 'tr' ? 'opacity-100' : 'opacity-100 md:opacity-0'
              }`}
              style={{
                transform: 'translate(50%, -50%)',
                zIndex: 10,
                touchAction: 'none',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 md:w-1.5 md:h-1.5 border-2 border-white rounded-sm"></div>
              </div>
            </div>
            {/* Bottom-left */}
            <div
              ref={resizeHandleRefs.bl}
              onMouseDown={(e) => handleResizeStart(e, 'bl')}
              onTouchStart={(e) => handleResizeStart(e, 'bl')}
              className={`absolute bottom-0 left-0 w-8 h-8 md:w-4 md:h-4 bg-blue-500 rounded-tr-lg cursor-nesw-resize md:opacity-0 md:group-hover:opacity-100 transition-opacity ${
                isResizing && resizeCorner === 'bl' ? 'opacity-100' : 'opacity-100 md:opacity-0'
              }`}
              style={{
                transform: 'translate(-50%, 50%)',
                zIndex: 10,
                touchAction: 'none',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 md:w-1.5 md:h-1.5 border-2 border-white rounded-sm"></div>
              </div>
            </div>
            {/* Bottom-right */}
            <div
              ref={resizeHandleRefs.br}
              onMouseDown={(e) => handleResizeStart(e, 'br')}
              onTouchStart={(e) => handleResizeStart(e, 'br')}
              className={`absolute bottom-0 right-0 w-8 h-8 md:w-4 md:h-4 bg-blue-500 rounded-tl-lg cursor-nwse-resize md:opacity-0 md:group-hover:opacity-100 transition-opacity ${
                isResizing && resizeCorner === 'br' ? 'opacity-100' : 'opacity-100 md:opacity-0'
              }`}
              style={{
                transform: 'translate(50%, 50%)',
                zIndex: 10,
                touchAction: 'none',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 md:w-1.5 md:h-1.5 border-2 border-white rounded-sm"></div>
              </div>
            </div>
          </>
        )}
        </div>

      </div>
    </NodeViewWrapper>
  )
}
