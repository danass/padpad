'use client'

import { useState, useEffect, useRef } from 'react'

export default function DragHandle({ editor, onAddClick, onOptionsClick }) {
  const [showButtons, setShowButtons] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const handleRef = useRef(null)

  useEffect(() => {
    const handle = handleRef.current
    if (!handle) return

    let tooltipTimeout

    const handleMouseEnter = () => {
      setShowButtons(true)
      tooltipTimeout = setTimeout(() => {
        setShowTooltip(true)
      }, 500)
    }

    const handleMouseLeave = () => {
      setShowButtons(false)
      setShowTooltip(false)
      clearTimeout(tooltipTimeout)
    }

    handle.addEventListener('mouseenter', handleMouseEnter)
    handle.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      handle.removeEventListener('mouseenter', handleMouseEnter)
      handle.removeEventListener('mouseleave', handleMouseLeave)
      clearTimeout(tooltipTimeout)
    }
  }, [])

  return (
    <div
      ref={handleRef}
      className="drag-handle-wrapper"
      style={{
        position: 'absolute',
        left: '-24px',
        top: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        opacity: showButtons ? 1 : 0,
        transition: 'opacity 0.2s',
      }}
    >
      {showTooltip && (
        <div
          className="absolute left-full ml-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50"
          style={{
            pointerEvents: 'none',
          }}
        >
          <div>Click for options</div>
          <div>Hold for drag</div>
        </div>
      )}
      
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (onAddClick) onAddClick()
        }}
        className="drag-handle-button drag-handle-add"
        title="Add content"
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '4px',
          border: '1px solid #e5e7eb',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '14px',
          lineHeight: '1',
        }}
      >
        +
      </button>
      
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (onOptionsClick) onOptionsClick()
        }}
        className="drag-handle-button drag-handle-options"
        title="Options"
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '4px',
          border: '1px solid #e5e7eb',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '12px',
          lineHeight: '1',
        }}
      >
        ⋮
      </button>
    </div>
  )
}


