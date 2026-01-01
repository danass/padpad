'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function SearchModal({ isOpen, onClose }) {
    const router = useRouter()
    const { t } = useLanguage()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef(null)
    const resultsRef = useRef(null)

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
            setQuery('')
            setResults(null)
            setSelectedIndex(0)
        }
    }, [isOpen])

    // Search with debounce
    useEffect(() => {
        if (!query.trim()) {
            setResults(null)
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
                    setSelectedIndex(0)
                }
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setLoading(false)
            }
        }, 200)

        return () => clearTimeout(timeoutId)
    }, [query])

    // Group results by date
    const groupedResults = useCallback(() => {
        if (!results?.documents) return { week: [], month: [], older: [] }

        const now = new Date()
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)

        const groups = { week: [], month: [], older: [] }

        results.documents.forEach(doc => {
            const docDate = new Date(doc.updated_at || doc.created_at)
            if (docDate > weekAgo) {
                groups.week.push(doc)
            } else if (docDate > monthAgo) {
                groups.month.push(doc)
            } else {
                groups.older.push(doc)
            }
        })

        return groups
    }, [results])

    // Get flat list for keyboard navigation
    const flatResults = useCallback(() => {
        const groups = groupedResults()
        return [
            ...(results?.folders || []).map(f => ({ ...f, type: 'folder' })),
            ...groups.week.map(d => ({ ...d, type: 'document' })),
            ...groups.month.map(d => ({ ...d, type: 'document' })),
            ...groups.older.map(d => ({ ...d, type: 'document' }))
        ]
    }, [results, groupedResults])

    // Keyboard navigation
    const handleKeyDown = (e) => {
        const items = flatResults()

        if (e.key === 'Escape') {
            onClose()
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => Math.min(prev + 1, items.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter' && items.length > 0) {
            e.preventDefault()
            const selected = items[selectedIndex]
            if (selected) {
                if (selected.type === 'folder') {
                    router.push(`/drive/folder/${selected.id}`)
                } else {
                    router.push(`/doc/${selected.id}`)
                }
                onClose()
            }
        }
    }

    // Scroll selected item into view
    useEffect(() => {
        if (resultsRef.current) {
            const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`)
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest' })
            }
        }
    }, [selectedIndex])

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const navigateTo = (item) => {
        if (item.type === 'folder') {
            router.push(`/drive/folder/${item.id}`)
        } else {
            router.push(`/doc/${item.id}`)
        }
        onClose()
    }

    if (!isOpen) return null

    const groups = groupedResults()
    let globalIndex = 0

    return (
        <div
            className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden"
                onKeyDown={handleKeyDown}
            >
                {/* Search Input */}
                <div className="flex items-center px-4 py-3 border-b border-gray-100">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t?.searchPlaceholder || "Search or ask a question..."}
                        className="flex-1 text-lg outline-none placeholder-gray-400"
                    />
                    {loading && (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-gray-600" />
                    )}
                    <kbd className="ml-3 px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded">
                        esc
                    </kbd>
                </div>

                {/* Results */}
                <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
                    {query && (
                        <>
                            {/* Folders */}
                            {results?.folders?.length > 0 && (
                                <div className="px-2 py-2">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
                                        {t?.folders || 'Folders'}
                                    </div>
                                    {results.folders.map((folder) => {
                                        const idx = globalIndex++
                                        return (
                                            <button
                                                key={folder.id}
                                                data-index={idx}
                                                onClick={() => navigateTo({ ...folder, type: 'folder' })}
                                                className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${selectedIndex === idx ? 'bg-gray-100' : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className="mr-3 text-xl">📁</span>
                                                <span className="font-medium text-gray-900">{folder.name}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Past week */}
                            {groups.week.length > 0 && (
                                <div className="px-2 py-2 border-t border-gray-100">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
                                        {t?.pastWeek || 'Past week'}
                                    </div>
                                    {groups.week.map((doc) => {
                                        const idx = globalIndex++
                                        return (
                                            <button
                                                key={doc.id}
                                                data-index={idx}
                                                onClick={() => navigateTo({ ...doc, type: 'document' })}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${selectedIndex === idx ? 'bg-gray-100' : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <span className="mr-3 text-xl">📄</span>
                                                    <span className="font-medium text-gray-900">{doc.title || t?.untitled || 'Untitled'}</span>
                                                    {doc.folder_name && (
                                                        <span className="ml-2 text-sm text-gray-400">— {doc.folder_name}</span>
                                                    )}
                                                </div>
                                                <span className="text-sm text-gray-400">{formatDate(doc.updated_at || doc.created_at)}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Past 30 days */}
                            {groups.month.length > 0 && (
                                <div className="px-2 py-2 border-t border-gray-100">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
                                        {t?.past30Days || 'Past 30 days'}
                                    </div>
                                    {groups.month.map((doc) => {
                                        const idx = globalIndex++
                                        return (
                                            <button
                                                key={doc.id}
                                                data-index={idx}
                                                onClick={() => navigateTo({ ...doc, type: 'document' })}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${selectedIndex === idx ? 'bg-gray-100' : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <span className="mr-3 text-xl">📄</span>
                                                    <span className="font-medium text-gray-900">{doc.title || t?.untitled || 'Untitled'}</span>
                                                    {doc.folder_name && (
                                                        <span className="ml-2 text-sm text-gray-400">— {doc.folder_name}</span>
                                                    )}
                                                </div>
                                                <span className="text-sm text-gray-400">{formatDate(doc.updated_at || doc.created_at)}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Older */}
                            {groups.older.length > 0 && (
                                <div className="px-2 py-2 border-t border-gray-100">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
                                        {t?.older || 'Older'}
                                    </div>
                                    {groups.older.map((doc) => {
                                        const idx = globalIndex++
                                        return (
                                            <button
                                                key={doc.id}
                                                data-index={idx}
                                                onClick={() => navigateTo({ ...doc, type: 'document' })}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${selectedIndex === idx ? 'bg-gray-100' : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <span className="mr-3 text-xl">📄</span>
                                                    <span className="font-medium text-gray-900">{doc.title || t?.untitled || 'Untitled'}</span>
                                                    {doc.folder_name && (
                                                        <span className="ml-2 text-sm text-gray-400">— {doc.folder_name}</span>
                                                    )}
                                                </div>
                                                <span className="text-sm text-gray-400">{formatDate(doc.updated_at || doc.created_at)}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* No results */}
                            {results && !results.folders?.length && !results.documents?.length && (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    {t?.noResultsFound || 'No results found'}
                                </div>
                            )}
                        </>
                    )}

                    {/* Empty state - show hint */}
                    {!query && (
                        <div className="px-4 py-8 text-center text-gray-400">
                            <p>{t?.searchHint || 'Start typing to search your documents...'}</p>
                            <div className="mt-4 flex justify-center gap-4 text-sm">
                                <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↑↓</kbd> {t?.navigate || 'Navigate'}</span>
                                <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↵</kbd> {t?.open || 'Open'}</span>
                                <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">esc</kbd> {t?.close || 'Close'}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
