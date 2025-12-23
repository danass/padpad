'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SearchBar({ onResults }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      // Only call onResults(null) if we had results before (to reset view)
      if (results !== null && onResults) {
        onResults(null)
      }
      return
    }
    
    const timeoutId = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        })
        
        if (response.ok) {
          const data = await response.json()
          setResults(data)
          if (onResults) onResults(data)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }, 300)
    
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])
  
  return (
    <div className="relative">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-black focus:border-black text-sm"
        />
      </div>
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      {results && query && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {results.documents && results.documents.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 px-2 py-1">Documents</div>
              {results.documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/doc/${doc.id}`}
                  className="block px-2 py-2 hover:bg-gray-50 rounded transition-colors"
                >
                  <div className="font-medium text-gray-900">{doc.title || 'Untitled'}</div>
                  {doc.content_text && (
                    <div className="text-sm text-gray-500 truncate">
                      {doc.content_text.substring(0, 100)}...
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
          
          {results.folders && results.folders.length > 0 && (
            <div className="p-2 border-t border-gray-200">
              <div className="text-xs font-semibold text-gray-500 px-2 py-1">Folders</div>
              {results.folders.map((folder) => (
                <Link
                  key={folder.id}
                  href={`/drive/folder/${folder.id}`}
                  className="block px-2 py-2 hover:bg-gray-50 rounded transition-colors"
                >
                  <div className="font-medium text-gray-900">📁 {folder.name}</div>
                </Link>
              ))}
            </div>
          )}
          
          {(!results.documents || results.documents.length === 0) &&
           (!results.folders || results.folders.length === 0) && (
            <div className="p-4 text-center text-gray-500">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  )
}





