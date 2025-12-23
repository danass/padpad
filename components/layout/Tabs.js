'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { X } from 'lucide-react'

export default function Tabs() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [tabs, setTabs] = useState([])
  
  // Clear tabs when user signs out
  useEffect(() => {
    if (!session) {
      setTabs([])
      localStorage.removeItem('openTabs')
    }
  }, [session])
  
  useEffect(() => {
    // Only load tabs if user is authenticated
    if (!session) {
      setTabs([])
      return
    }
    
    // Load tabs from localStorage
    const savedTabs = localStorage.getItem('openTabs')
    if (savedTabs) {
      try {
        const parsed = JSON.parse(savedTabs)
        setTabs(parsed)
      } catch (e) {
        console.error('Error parsing saved tabs:', e)
      }
    }
  }, [session])
  
  useEffect(() => {
    // Don't add tabs if user is not authenticated
    if (!session) {
      return
    }
    
    // Add current document to tabs if it's a document page
    if (pathname?.startsWith('/doc/')) {
      const docId = pathname.split('/doc/')[1]
      if (docId) {
        setTabs(prev => {
          // Check if tab already exists
          const exists = prev.find(t => t.id === docId)
          if (exists) {
            return prev.map(t => t.id === docId ? { ...t, active: true } : { ...t, active: false })
          }
          
          // Add new tab
          const newTab = {
            id: docId,
            title: 'Untitled',
            active: true,
          }
          
          // Fetch document title asynchronously
          fetch(`/api/documents/${docId}`)
            .then(res => {
              if (res.ok) {
                return res.json()
              }
              // If 404, document doesn't exist or user doesn't have access
              // Just keep the tab with 'Untitled' - don't throw error
              if (res.status === 404) {
                return null
              }
              throw new Error('Failed to fetch document')
            })
            .then(data => {
              if (data && data.document) {
                setTabs(prevTabs => 
                  prevTabs.map(t => 
                    t.id === docId ? { ...t, title: data.document.title || 'Untitled' } : t
                  )
                )
              }
            })
            .catch(err => {
              // Silently handle errors - just keep the tab with 'Untitled'
              // Don't log 404 errors as they're expected for unauthorized access
              if (err.message !== 'Failed to fetch document') {
                console.error('Error fetching document title:', err)
              }
            })
          
          return prev.map(t => ({ ...t, active: false })).concat(newTab)
        })
      }
    } else {
      // Keep tabs in the list even when not on a document page
      // Just deactivate them, but don't remove them
      setTabs(prev => prev.map(t => ({ ...t, active: false })))
    }
  }, [pathname, session])
  
  useEffect(() => {
    // Save tabs to localStorage whenever tabs change
    // This ensures tabs persist across page reloads and navigation
    localStorage.setItem('openTabs', JSON.stringify(tabs))
  }, [tabs])
  
  const closeTab = (e, tabId) => {
    e.stopPropagation()
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId)
      // If closed tab was active, activate another tab or go to drive
      const closedTab = prev.find(t => t.id === tabId)
      if (closedTab?.active) {
        // Defer navigation to avoid updating Router during render
        setTimeout(() => {
          if (newTabs.length > 0) {
            router.push(`/doc/${newTabs[newTabs.length - 1].id}`)
          } else {
            router.push('/drive')
          }
        }, 0)
      }
      return newTabs
    })
  }
  
  const switchTab = (tabId) => {
    router.push(`/doc/${tabId}`)
  }
  
  // Listen for document title updates
  useEffect(() => {
    const handleTitleUpdate = (event) => {
      const { documentId, title } = event.detail
      setTabs(prev => 
        prev.map(t => 
          t.id === documentId ? { ...t, title: title || 'Untitled' } : t
        )
      )
    }
    
    // Listen for document deletion
    const handleDocumentDeleted = (event) => {
      const { documentId } = event.detail
      setTabs(prev => {
        const newTabs = prev.filter(t => t.id !== documentId)
        // If deleted tab was active, we'll handle navigation separately
        const deletedTab = prev.find(t => t.id === documentId)
        if (deletedTab?.active) {
          // Defer navigation to avoid updating Router during render
          setTimeout(() => {
            if (newTabs.length > 0) {
              router.push(`/doc/${newTabs[newTabs.length - 1].id}`)
            } else {
              router.push('/drive')
            }
          }, 0)
        }
        return newTabs
      })
    }
    
    window.addEventListener('documentTitleUpdated', handleTitleUpdate)
    window.addEventListener('documentDeleted', handleDocumentDeleted)
    return () => {
      window.removeEventListener('documentTitleUpdated', handleTitleUpdate)
      window.removeEventListener('documentDeleted', handleDocumentDeleted)
    }
  }, [router])
  
  // Don't render if no tabs
  if (tabs.length === 0) return null
  
  return (
    <>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => switchTab(tab.id)}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium cursor-pointer transition-colors border-b-2 ${
            tab.active
              ? 'border-gray-900 text-gray-900 bg-gray-50'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <span className="whitespace-nowrap">{tab.title || 'Untitled'}</span>
          <button
            onClick={(e) => closeTab(e, tab.id)}
            className="ml-1 p-0.5 rounded hover:bg-gray-200 transition-colors"
            aria-label="Close tab"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </>
  )
}



