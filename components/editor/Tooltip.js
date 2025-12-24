'use client'

import { useState, useRef, useEffect } from 'react'

export default function Tooltip({ children, text, shortcut }) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const timeoutRef = useRef(null)
  const tooltipRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = (e) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    const target = triggerRef.current
    if (target) {
      const rect = target.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 4,
        left: rect.left + (rect.width / 2)
      })
      
      timeoutRef.current = setTimeout(() => {
        setShow(true)
      }, 150)
    }
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setShow(false)
  }

  useEffect(() => {
    if (show && tooltipRef.current && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      
      const newTop = triggerRect.bottom + 4
      let newLeft = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
      
      if (newLeft < 8) {
        newLeft = 8
      } else if (newLeft + tooltipRect.width > window.innerWidth - 8) {
        newLeft = window.innerWidth - tooltipRect.width - 8
      }
      
      setPosition({ top: newTop, left: newLeft })
    }
  }, [show])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      {show && (
        <div
          ref={tooltipRef}
          className="fixed z-[10004] bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded shadow-xl pointer-events-none whitespace-nowrap"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center gap-2">
            <span>{text}</span>
            {shortcut && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400 font-mono text-[10px]">{shortcut}</span>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
