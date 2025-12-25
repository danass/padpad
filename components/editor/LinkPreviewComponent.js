'use client'

import { useEffect, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { ExternalLink, X, RefreshCw } from 'lucide-react'

export default function LinkPreviewComponent({ node, updateAttributes, deleteNode, editor }) {
    const { url, title, description, image, siteName, favicon, loading } = node.attrs
    const [isLoading, setIsLoading] = useState(loading)
    const [error, setError] = useState(false)

    // Fetch metadata on mount or when url changes
    useEffect(() => {
        if (url && !title) {
            fetchMetadata()
        }
    }, [url]) // eslint-disable-line react-hooks/exhaustive-deps

    const fetchMetadata = async () => {
        if (!url) return

        setIsLoading(true)
        setError(false)
        updateAttributes({ loading: true })

        try {
            const response = await fetch('/api/unfurl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            })

            if (!response.ok) {
                throw new Error('Failed to fetch')
            }

            const data = await response.json()

            updateAttributes({
                title: data.title,
                description: data.description,
                image: data.image,
                siteName: data.siteName,
                favicon: data.favicon,
                loading: false,
            })
        } catch (err) {
            console.error('Failed to fetch link preview:', err)
            setError(true)
            updateAttributes({ loading: false })
        } finally {
            setIsLoading(false)
        }
    }

    const handleClick = () => {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer')
        }
    }

    // Loading state
    if (isLoading) {
        return (
            <NodeViewWrapper className="link-preview-wrapper my-4">
                <div className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded" />
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                    </div>
                </div>
            </NodeViewWrapper>
        )
    }

    // Error state - show simple link
    if (error || !title) {
        return (
            <NodeViewWrapper className="link-preview-wrapper my-4">
                <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline flex-1 min-w-0"
                    >
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{url}</span>
                    </a>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); fetchMetadata() }}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Retry"
                        >
                            <RefreshCw className="w-4 h-4 text-gray-500" />
                        </button>
                        {editor.isEditable && (
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteNode() }}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Remove"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        )}
                    </div>
                </div>
            </NodeViewWrapper>
        )
    }

    // Rich preview - super compact like a button/chip
    return (
        <NodeViewWrapper className="link-preview-wrapper inline" data-drag-handle>
            <span
                className="inline-flex items-center gap-1.5 px-2 py-1 border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer group relative text-sm"
                onClick={handleClick}
            >
                {/* Favicon */}
                {(favicon || image) && (
                    <img
                        src={favicon || image}
                        alt=""
                        className="w-4 h-4 rounded-sm flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                )}

                {/* Site name / title - very short */}
                <span className="text-gray-700 truncate max-w-[120px]">
                    {siteName || title || new URL(url).hostname}
                </span>

                {/* Delete button on hover */}
                {editor.isEditable && (
                    <button
                        onClick={(e) => { e.stopPropagation(); deleteNode() }}
                        className="ml-0.5 p-0.5 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                    >
                        <X className="w-3 h-3 text-gray-500" />
                    </button>
                )}
            </span>
        </NodeViewWrapper>
    )
}
