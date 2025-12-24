'use client'

import { useEffect, useRef } from 'react'

export default function SEOKeywords({ keywords }) {
  const metaRef = useRef(null)
  
  useEffect(() => {
    // Only run on client side
    if (typeof document === 'undefined' || !document.head) return
    
    // Create meta tag only once
    if (!metaRef.current) {
      metaRef.current = document.createElement('meta')
      metaRef.current.name = 'keywords'
    }
    
    metaRef.current.content = keywords
    
    // Only append if not already in DOM
    if (!metaRef.current.parentNode) {
      document.head.appendChild(metaRef.current)
    }
    
    return () => {
      // Cleanup on unmount - use ref instead of query
      if (metaRef.current && metaRef.current.parentNode) {
        try {
          metaRef.current.parentNode.removeChild(metaRef.current)
        } catch (e) {
          // Ignore errors if element already removed
        }
      }
    }
  }, [keywords])
  
  return null
}

