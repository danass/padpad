'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

export default function Tooltip({ children, label, shortcut, position = 'bottom' }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isPositioned, setIsPositioned] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mousePressed, setMousePressed] = useState(false)
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Detect mobile/touch devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 768
      )
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return null

    const triggerRect = triggerRef.current.getBoundingClientRect()

    // Estimate tooltip size (will be refined after render)
    const estimatedWidth = 150
    const estimatedHeight = 32

    let top, left

    switch (position) {
      case 'top':
        top = triggerRect.top - estimatedHeight - 8
        left = triggerRect.left + (triggerRect.width / 2) - (estimatedWidth / 2)
        break
      case 'bottom':
      default:
        top = triggerRect.bottom + 8
        left = triggerRect.left + (triggerRect.width / 2) - (estimatedWidth / 2)
        break
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (estimatedHeight / 2)
        left = triggerRect.left - estimatedWidth - 8
        break
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (estimatedHeight / 2)
        left = triggerRect.right + 8
        break
    }

    return { top, left }
  }, [position])

  const showTooltip = () => {
    // Don't show tooltips on mobile/touch devices or if mouse is pressed
    if (isMobile || mousePressed) return

    // Calculate position before showing
    const initialPos = calculatePosition()
    if (initialPos) {
      setCoords(initialPos)
    }

    // Show tooltip immediately (no delay)
    setIsVisible(true)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
    setIsPositioned(false)
  }

  const handleMouseDown = () => {
    setMousePressed(true)
    hideTooltip()
  }

  const handleMouseUp = () => {
    setMousePressed(false)
  }

  // Listen for global mouseup to reset pressed state
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  // Refine position after tooltip is rendered
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()

      let top, left

      switch (position) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - 8
          left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
          break
        case 'bottom':
        default:
          top = triggerRect.bottom + 8
          left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
          break
        case 'left':
          top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
          left = triggerRect.left - tooltipRect.width - 8
          break
        case 'right':
          top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
          left = triggerRect.right + 8
          break
      }

      // Keep tooltip within viewport
      if (left < 8) left = 8
      if (left + tooltipRect.width > window.innerWidth - 8) {
        left = window.innerWidth - tooltipRect.width - 8
      }
      if (top < 8) top = triggerRect.bottom + 8

      setCoords({ top, left })
      setIsPositioned(true)
    }
  }, [isVisible, position])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const tooltipContent = isVisible && mounted && createPortal(
    <div
      ref={tooltipRef}
      className="fixed z-[9999] px-3 py-1.5 bg-white border border-gray-100 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] text-sm text-gray-700 whitespace-nowrap pointer-events-none"
      style={{
        top: coords.top,
        left: coords.left,
        opacity: isPositioned ? 1 : 0,
        transition: 'opacity 150ms ease-out, transform 150ms ease-out',
        transform: isPositioned ? 'translateY(0)' : 'translateY(4px)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{label}</span>
        {shortcut && (
          <>
            <span className="text-gray-200">|</span>
            <span className="flex items-center gap-0.5 text-gray-400">
              {shortcut.map((key, i) => (
                <kbd
                  key={i}
                  className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 bg-gray-50 border border-gray-200 rounded text-[10px] font-semibold text-gray-500"
                >
                  {key}
                </kbd>
              ))}
            </span>
          </>
        )}
      </div>
    </div>,
    document.body
  )

  return (
    <div
      ref={triggerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onMouseDown={handleMouseDown}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      className="inline-flex"
    >
      {children}
      {tooltipContent}
    </div>
  )
}

