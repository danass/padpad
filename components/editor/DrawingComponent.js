'use client'

import { useEffect, useRef, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Undo2, Download, Move, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function DrawingComponent({ node, updateAttributes, deleteNode, editor, getPos }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState([])
  const currentPathRef = useRef([])
  const currentColorRef = useRef('#000000')
  const lastSelectedColorRef = useRef('#000000') // Keep track of last color selected from toolbar
  const isDrawingRef = useRef(false)
  const nodeRef = useRef(node)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showHoverMenu, setShowHoverMenu] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeCorner, setResizeCorner] = useState(null)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const clickStartRef = useRef(null)
  const hasMovedRef = useRef(false)
  const [maxWidth, setMaxWidth] = useState(null)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 })
  const [moveMode, setMoveMode] = useState(false) // Toggle for move mode

  const { paths, width, height, x, y, align = 'center' } = node.attrs

  // Calculate responsive width for mobile
  useEffect(() => {
    const updateMaxWidth = () => {
      if (typeof window !== 'undefined') {
        // Leave some padding on mobile
        const availableWidth = window.innerWidth - 48
        setMaxWidth(availableWidth < 400 ? availableWidth : null)
      }
    }
    updateMaxWidth()
    window.addEventListener('resize', updateMaxWidth)
    return () => window.removeEventListener('resize', updateMaxWidth)
  }, [])

  // Calculate actual display dimensions (constrained by maxWidth on mobile)
  const displayWidth = maxWidth && width > maxWidth ? maxWidth : (width || 400)
  const displayHeight = maxWidth && width > maxWidth
    ? Math.round((height || 300) * (maxWidth / (width || 400)))
    : (height || 300)

  // Ensure paths is always an array
  const savedPaths = Array.isArray(paths) ? paths : []

  // Keep node ref in sync
  useEffect(() => {
    nodeRef.current = node
  }, [node])

  // Check if drawing is currently selected
  const isSelected = editor.isActive('drawing')

  // Check if drawing is in absolute position
  const isAbsolute = x !== null && x !== undefined && y !== null && y !== undefined

  // Get current text color from editor
  const getCurrentTextColor = () => {
    try {
      const attrs = editor.getAttributes('textStyle')
      return attrs.color || '#000000'
    } catch {
      return '#000000'
    }
  }

  // Initialize color from editor
  useEffect(() => {
    const initColor = getCurrentTextColor()
    currentColorRef.current = initColor
  }, [])

  // Listen for text color changes - ALWAYS update the pen color
  useEffect(() => {
    const handleColorChange = (e) => {
      const newColor = e?.detail?.color

      // ALWAYS update the drawing color when a color is selected from toolbar
      if (newColor) {
        currentColorRef.current = newColor
        lastSelectedColorRef.current = newColor // Remember this color!

        // Update canvas border color to show active pen color (only if selected)
        if (isSelected && canvasRef.current) {
          canvasRef.current.style.borderColor = newColor
        }
      }
    }

    window.addEventListener('textColorChanged', handleColorChange)

    const handleToggleMoveMode = (e) => {
      const { pos } = e.detail
      if (typeof getPos === 'function' && pos === getPos()) {
        setMoveMode(prev => !prev)
      }
    }
    window.addEventListener('toggleDrawingMoveMode', handleToggleMoveMode)

    return () => {
      window.removeEventListener('textColorChanged', handleColorChange)
      window.removeEventListener('toggleDrawingMoveMode', handleToggleMoveMode)
    }
  }, [isSelected, getPos])

  // Draw all paths on canvas - ensure permanent rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Use requestAnimationFrame to ensure smooth rendering
    requestAnimationFrame(() => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw all saved paths - these are permanent
      if (savedPaths && savedPaths.length > 0) {
        savedPaths.forEach((path) => {
          if (path.points && path.points.length > 0) {
            ctx.strokeStyle = path.color || '#000000'
            ctx.lineWidth = 2
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.beginPath()
            ctx.moveTo(path.points[0].x, path.points[0].y)
            for (let i = 1; i < path.points.length; i++) {
              ctx.lineTo(path.points[i].x, path.points[i].y)
            }
            ctx.stroke()
          }
        })
      }

      // Draw current path if drawing (temporary preview)
      if (isDrawing && currentPath.length > 0) {
        ctx.strokeStyle = currentColorRef.current
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(currentPath[0].x, currentPath[0].y)
        for (let i = 1; i < currentPath.length; i++) {
          ctx.lineTo(currentPath[i].x, currentPath[i].y)
        }
        ctx.stroke()
      }
    })
  }, [savedPaths, isDrawing, currentPath, width, height, displayWidth, displayHeight])

  // Get point from event
  const getPointFromEvent = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  // Start drawing
  const startDrawing = (e) => {
    if (!editor.isEditable) return
    if (isDragging || isResizing) return

    e.preventDefault()
    e.stopPropagation()

    const point = getPointFromEvent(e)
    if (!point) return

    // Get the current color from multiple sources (in priority order):
    // 1. Global window.__drawingPenColor (set by toolbar)
    // 2. Editor's current textStyle color
    // 3. Default black
    const globalColor = typeof window !== 'undefined' ? window.__drawingPenColor : null
    const editorColor = getCurrentTextColor()

    // Use global color if available, otherwise use editor color
    currentColorRef.current = globalColor || editorColor || '#000000'

    setIsDrawing(true)
    isDrawingRef.current = true
    setCurrentPath([point])
    currentPathRef.current = [point]
    hasMovedRef.current = false
    clickStartRef.current = null
  }

  // Draw
  const draw = (e) => {
    if (!isDrawingRef.current) return

    const point = getPointFromEvent(e)
    if (!point) return

    currentPathRef.current = [...currentPathRef.current, point]
    setCurrentPath(currentPathRef.current)
  }

  // Stop drawing - use refs to get latest values
  const stopDrawing = () => {
    if (!isDrawingRef.current) return

    const pathPoints = currentPathRef.current
    if (pathPoints.length > 0) {
      // Store path to save
      const pathToSave = {
        points: [...pathPoints],
        color: currentColorRef.current,
      }

      // Get latest paths from node ref to ensure we have the most current state
      const currentPaths = Array.isArray(nodeRef.current.attrs.paths) ? nodeRef.current.attrs.paths : []

      // Save immediately to make drawing permanent
      const newPaths = [...currentPaths, pathToSave]
      updateAttributes({ paths: newPaths })
    }

    setIsDrawing(false)
    isDrawingRef.current = false
    // Clear currentPath after a brief delay to allow rendering
    setTimeout(() => {
      setCurrentPath([])
      currentPathRef.current = []
    }, 50)
  }

  // Global mouse/touch events for drawing
  useEffect(() => {
    if (!isDrawing) return

    const handleMove = (e) => {
      draw(e)
    }

    const handleEnd = () => {
      stopDrawing()
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleMove, { passive: false })
    window.addEventListener('touchend', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isDrawing])

  // Dragging handlers
  const startDragging = (e) => {
    if (!editor.isEditable) return
    if (isDrawing || isResizing) return
    e.preventDefault()
    e.stopPropagation()

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    clickStartRef.current = { x: clientX, y: clientY, time: Date.now() }
    hasMovedRef.current = false

    setIsDragging(true)
    setDragStart({
      x: clientX - (x || 0),
      y: clientY - (y || 0),
    })
  }


  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY

      // Check if we've moved enough to consider it a drag
      if (clickStartRef.current) {
        const dx = Math.abs(clientX - clickStartRef.current.x)
        const dy = Math.abs(clientY - clickStartRef.current.y)
        if (dx > 5 || dy > 5) {
          hasMovedRef.current = true
        }
      }

      // Only update position if we've moved (not just a click)
      if (hasMovedRef.current) {
        const newX = clientX - dragStart.x
        const newY = clientY - dragStart.y

        // Update position (absolute positioning)
        updateAttributes({ x: newX, y: newY })
      }
    }

    const handleEnd = () => {
      setIsDragging(false)
      clickStartRef.current = null
      hasMovedRef.current = false
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleMove, { passive: false })
    window.addEventListener('touchend', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, dragStart, updateAttributes, x, y, isAbsolute, isSelected])

  // Enable absolute positioning - keep current position
  const enableAbsolutePosition = () => {
    if (!editor.isEditable) return

    const editorElement = editor.view.dom.closest('.prose') || editor.view.dom.parentElement
    if (!editorElement || !containerRef.current) return

    const editorRect = editorElement.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()

    // Calculate current position relative to editor (keep it in place)
    const currentX = containerRect.left - editorRect.left + editorElement.scrollLeft
    const currentY = containerRect.top - editorRect.top + editorElement.scrollTop

    // Enable absolute positioning with current position
    updateAttributes({
      x: currentX,
      y: currentY
    })
  }

  // Disable absolute positioning (remettre dans le flux)
  const disableAbsolutePosition = () => {
    if (!editor.isEditable) return
    updateAttributes({ x: null, y: null })
  }

  // Undo last stroke
  const handleUndo = () => {
    // Get latest paths from node.attrs to ensure we have the most current state
    const currentPaths = Array.isArray(node.attrs.paths) ? node.attrs.paths : []
    if (currentPaths.length === 0) return
    const newPaths = currentPaths.slice(0, -1)
    updateAttributes({ paths: newPaths })
    // Force editor update to ensure persistence
    if (editor && editor.view) {
      editor.view.dispatch(editor.state.tr)
    }
  }

  // Export as PNG
  const handleExportPNG = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `drawing-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        if (a.parentNode) {
          document.body.removeChild(a)
        }
        URL.revokeObjectURL(url)
      }, 0)
    }, 'image/png')
  }

  // NOTE: Keyboard delete removed - let Tiptap's default selection+delete work naturally
  // Users can still delete via hover menu or context menu

  // Resize handlers
  const startResize = (e, corner) => {
    if (!editor.isEditable) return
    if (isDrawing || isDragging) return
    e.preventDefault()
    e.stopPropagation()

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    setIsResizing(true)
    setResizeCorner(corner)
    setResizeStart({
      x: clientX,
      y: clientY,
      width: width || 400,
      height: height || 300,
    })
  }

  useEffect(() => {
    if (!isResizing || !resizeCorner) return

    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY

      const deltaX = clientX - resizeStart.x
      const deltaY = clientY - resizeStart.y

      let newWidth = resizeStart.width
      let newHeight = resizeStart.height

      if (resizeCorner === 'br' || resizeCorner === 'tr') {
        newWidth = Math.max(100, resizeStart.width + deltaX)
      }
      if (resizeCorner === 'br' || resizeCorner === 'bl') {
        newHeight = Math.max(100, resizeStart.height + deltaY)
      }
      if (resizeCorner === 'tl') {
        newWidth = Math.max(100, resizeStart.width - deltaX)
        newHeight = Math.max(100, resizeStart.height - deltaY)
      }
      if (resizeCorner === 'tr') {
        newWidth = Math.max(100, resizeStart.width + deltaX)
        newHeight = Math.max(100, resizeStart.height - deltaY)
      }
      if (resizeCorner === 'bl') {
        newWidth = Math.max(100, resizeStart.width - deltaX)
        newHeight = Math.max(100, resizeStart.height + deltaY)
      }

      updateAttributes({ width: newWidth, height: newHeight })
    }

    const handleEnd = () => {
      setIsResizing(false)
      setResizeCorner(null)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleMove, { passive: false })
    window.addEventListener('touchend', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isResizing, resizeCorner, resizeStart, updateAttributes])

  // Calculate container style for absolute positioning and alignment
  const getAlignMargin = () => {
    if (isAbsolute) return undefined
    switch (align) {
      case 'left': return '0 auto 0 0'
      case 'right': return '0 0 0 auto'
      default: return '0 auto' // center
    }
  }

  const containerStyle = {
    position: (x !== null && x !== undefined && y !== null && y !== undefined) ? 'absolute' : 'relative',
    left: (x !== null && x !== undefined) ? `${x}px` : undefined,
    top: (y !== null && y !== undefined) ? `${y}px` : undefined,
    width: isAbsolute ? `${displayWidth}px` : 'fit-content',
    maxWidth: '100%',
    margin: getAlignMargin(),
    zIndex: 5, // Low z-index for drawing canvas, below header/toolbar
  }

  const handleAlign = (newAlign) => {
    updateAttributes({ align: newAlign })
  }

  return (
    <NodeViewWrapper className="drawing-wrapper block" data-drag-handle={editor.isEditable ? '' : undefined}>
      <div
        ref={containerRef}
        className="group relative block"
        style={containerStyle}
        onMouseEnter={() => setShowHoverMenu(true)}
        onMouseLeave={() => setShowHoverMenu(false)}
      >
        <div className="relative" style={{ width: `${displayWidth}px`, height: `${displayHeight}px`, maxWidth: '100%' }}>
          <canvas
            ref={canvasRef}
            width={displayWidth}
            height={displayHeight}
            style={{
              width: `${displayWidth}px`,
              height: `${displayHeight}px`,
              maxWidth: '100%',
              border: editor.isEditable
                ? (isSelected ? `2px solid ${currentColorRef.current}` : '1px solid #e5e7eb')
                : 'none',
              borderRadius: '0',
              backgroundColor: 'transparent',
              cursor: editor.isEditable
                ? (isDragging || moveMode ? 'grab' : (isResizing ? 'nwse-resize' : 'crosshair'))
                : 'default',
              touchAction: editor.isEditable ? 'none' : 'auto',
              display: 'block',
            }}
            onContextMenu={(e) => {
              // Local context menu removed in favor of global editor context menu
            }}
            onMouseDown={(e) => {
              // Check if clicking on resize handle - now for ALL drawings
              const rect = canvasRef.current?.getBoundingClientRect()
              if (rect) {
                const clickX = e.clientX - rect.left
                const clickY = e.clientY - rect.top
                const handleSize = 12 // Slightly larger hit area

                // Check corners
                if (clickX <= handleSize && clickY <= handleSize) {
                  startResize(e, 'tl')
                  return
                }
                if (clickX >= rect.width - handleSize && clickY <= handleSize) {
                  startResize(e, 'tr')
                  return
                }
                if (clickX <= handleSize && clickY >= rect.height - handleSize) {
                  startResize(e, 'bl')
                  return
                }
                if (clickX >= rect.width - handleSize && clickY >= rect.height - handleSize) {
                  startResize(e, 'br')
                  return
                }
              }

              // If absolute position:
              // - If move mode is ON, drag on click
              // - Hold Alt/Option to drag (fallback)
              // - Normal click to draw
              if (isAbsolute) {
                if (moveMode || e.altKey) {
                  startDragging(e)
                } else {
                  startDrawing(e)
                }
              } else {
                // Not absolute, always start drawing
                startDrawing(e)
              }
            }}
            onTouchStart={(e) => {
              // Similar logic for touch
              const rect = canvasRef.current?.getBoundingClientRect()
              if (rect && !isAbsolute) {
                const touch = e.touches[0]
                const clickX = touch.clientX - rect.left
                const clickY = touch.clientY - rect.top
                const handleSize = 8

                if (clickX <= handleSize && clickY <= handleSize) {
                  startResize(e, 'tl')
                  return
                }
                if (clickX >= rect.width - handleSize && clickY <= handleSize) {
                  startResize(e, 'tr')
                  return
                }
                if (clickX <= handleSize && clickY >= rect.height - handleSize) {
                  startResize(e, 'bl')
                  return
                }
                if (clickX >= rect.width - handleSize && clickY >= rect.height - handleSize) {
                  startResize(e, 'br')
                  return
                }
              }

              // For touch on absolute: two finger touch = drag, one finger = draw
              if (isAbsolute) {
                if (e.touches.length >= 2) {
                  // Two fingers = drag
                  startDragging(e)
                } else {
                  // One finger = draw
                  startDrawing(e)
                }
              } else {
                startDrawing(e)
              }
            }}
            className={`transition-all ${editor.isEditable ? 'group-hover:ring-2 group-hover:ring-blue-400' : ''}`}
          />

          {/* Move Mode Tooltip */}
          {editor.isEditable && isAbsolute && moveMode && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600/90 text-white px-4 py-2 rounded-lg text-sm font-medium z-30 pointer-events-none shadow-xl backdrop-blur-sm animate-in fade-in zoom-in duration-200">
              {t?.moveHint || 'Hold and drag to move'}
            </div>
          )}

          {/* Resize handles - show for both absolute and normal */}
          {editor.isEditable && (
            <>
              <div
                className="absolute top-0 left-0 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-nwse-resize z-10"
                style={{ transform: 'translate(-50%, -50%)' }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  startResize(e, 'tl')
                }}
              />
              <div
                className="absolute top-0 right-0 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-nesw-resize z-10"
                style={{ transform: 'translate(50%, -50%)' }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  startResize(e, 'tr')
                }}
              />
              <div
                className="absolute bottom-0 left-0 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-nesw-resize z-10"
                style={{ transform: 'translate(-50%, 50%)' }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  startResize(e, 'bl')
                }}
              />
              <div
                className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 border border-white rounded-full cursor-nwse-resize z-10"
                style={{ transform: 'translate(50%, 50%)' }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  startResize(e, 'br')
                }}
              />
            </>
          )}

          {/* Hover and Context Menus */}
          {editor.isEditable && (
            <>
              {showHoverMenu && !isDragging && (
                <div className="absolute bottom-2 right-2 bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex gap-1 z-20 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  {!isAbsolute && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAlign('left') }}
                        className={`p-2 rounded transition-colors ${align === 'left' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        title={t?.alignLeft || 'Align left'}
                      >
                        <AlignLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAlign('center') }}
                        className={`p-2 rounded transition-colors ${align === 'center' || !align ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        title={t?.alignCenter || 'Align center'}
                      >
                        <AlignCenter className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAlign('right') }}
                        className={`p-2 rounded transition-colors ${align === 'right' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        title={t?.alignRight || 'Align right'}
                      >
                        <AlignRight className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="w-px h-6 bg-gray-200 mx-0.5" />
                    </>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleUndo() }}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title={t?.undo || 'Undo stroke'}
                  >
                    <Undo2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleExportPNG() }}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title={t?.export || 'Export PNG'}
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNode()
                    }}
                    className="p-2 hover:bg-red-50 text-red-500 rounded transition-colors"
                    title={t?.delete || 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </NodeViewWrapper >
  )
}
