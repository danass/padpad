'use client'

import { useEffect, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { ExternalLink, X, RefreshCw } from 'lucide-react'

export default function LinkPreviewComponent({ node, updateAttributes, deleteNode, editor }) {
    const { url, title, description, image, siteName, favicon, loading } = node.attrs
    const [isLoading, setIsLoading] = useState(loading)
    const [error, setError] = useState(false)

    // Fetch metadata if not already loaded
    useEffect(() => {
        if (url && !title && !isLoading && !error) {
            fetchMetadata()
        }
    }, [url])

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

    // Rich preview
    return (
        <NodeViewWrapper className="link-preview-wrapper my-4" data-drag-handle>
            <div
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group relative"
                onClick={handleClick}
            >
                {/* Delete button */}
                {editor.isEditable && (
                    <button
                        onClick={(e) => { e.stopPropagation(); deleteNode() }}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Remove"
                    >
                        <X className="w-4 h-4 text-gray-600" />
                    </button>
                )}

                <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    {image && (
                        <div className="sm:w-48 sm:flex-shrink-0 h-32 sm:h-auto bg-gray-100 overflow-hidden">
                            <img
                                src={image}
                                alt={title || 'Link preview'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none'
                                }}
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-4 flex-1 min-w-0">
                        {/* Site info */}
                        <div className="flex items-center gap-2 mb-2">
                            {favicon && (
                                <img
                                    src={favicon}
                                    alt=""
                                    className="w-4 h-4"
                                    onError={(e) => { e.target.style.display = 'none' }}
                                />
                            )}
                            <span className="text-xs text-gray-500 uppercase tracking-wide truncate">
                                {siteName || new URL(url).hostname}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                            {title}
                        </h3>

                        {/* Description */}
                        {description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </NodeViewWrapper>
    )
}
