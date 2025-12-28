'use client'

import { useEffect, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { ExternalLink, X, RefreshCw, AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react'

export default function LinkPreviewComponent({ node, updateAttributes, deleteNode, editor, selected, getPos }) {
    const { url, title, description, image, siteName, favicon, loading, size = 's', showImage = true, textAlign = 'left' } = node.attrs
    const [error, setError] = useState(false)
    const [showHoverMenu, setShowHoverMenu] = useState(false)

    // Fetch metadata on mount or when url changes
    useEffect(() => {
        if (url && !title) {
            fetchMetadata()
        }
    }, [url]) // eslint-disable-line react-hooks/exhaustive-deps

    const fetchMetadata = async () => {
        if (!url) return

        setError(false)
        // Use microtask to avoid flushSync collision
        queueMicrotask(() => {
            updateAttributes({ loading: true })
        })

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

            queueMicrotask(() => {
                updateAttributes({
                    title: data.title,
                    description: data.description,
                    image: data.image,
                    siteName: data.siteName,
                    favicon: data.favicon,
                    loading: false,
                })
            })
        } catch (err) {
            console.error('Failed to fetch link preview:', err)
            setError(true)
            queueMicrotask(() => {
                updateAttributes({ loading: false })
            })
        }
    }

    const handleClick = (e) => {
        if (editor.isEditable) {
            e.stopPropagation()
            // Select the node in the editor
            if (typeof getPos === 'function') {
                editor.commands.setNodeSelection(getPos())
            }
        } else if (url) {
            window.open(url, '_blank', 'noopener,noreferrer')
        }
    }


    const setSize = (newSize) => {
        updateAttributes({ size: newSize })
    }

    const toggleImage = () => {
        updateAttributes({ showImage: !showImage })
    }

    // Loading state
    if (loading) {
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

    // Style based on size
    const sizeStyles = {
        'text': 'max-w-full inline-block',
        'xs': 'max-w-[30px] inline-block',
        's': 'max-w-[100px] inline-block',
        'm': 'max-w-[300px] block',
        'full': 'max-w-2xl block'
    }

    const wrapperClass = size === 'text' || size === 'xs' || size === 's' ? 'inline' : 'block my-6'

    if (size === 'text') {
        return (
            <NodeViewWrapper className="link-preview-wrapper my-4">
                <div className={`border rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 transition-colors group ${selected || editor.isActive('linkPreview') ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-cyan-600 hover:underline flex-1 min-w-0"
                        onClick={(e) => { if (editor.isEditable) { e.preventDefault(); handleClick(e) } }}
                    >
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{title || url}</span>
                    </a>
                    {editor.isEditable && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); fetchMetadata() }}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Retry"
                            >
                                <RefreshCw className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteNode() }}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Remove"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    )}
                </div>
            </NodeViewWrapper>
        )
    }

    if (size === 'xs' || size === 's') {
        const isXS = size === 'xs'
        return (
            <NodeViewWrapper
                className="link-preview-wrapper inline"
                data-drag-handle
                onMouseEnter={() => setShowHoverMenu(true)}
                onMouseLeave={() => setShowHoverMenu(false)}
                style={{ textAlign: node.attrs.textAlign }}
            >
                <div
                    onClick={handleClick}
                    className={`inline-flex flex-col items-center gap-1 p-1 border rounded-lg hover:border-blue-200 hover:shadow-sm cursor-pointer group transition-all bg-white overflow-hidden align-middle ${isXS ? 'w-[30px]' : 'w-[100px]'} ${selected || editor.isActive('linkPreview') ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100'}`}
                >
                    {showImage && (image || favicon) ? (
                        <div className={`bg-gray-50 rounded w-full flex items-center justify-center overflow-hidden ${isXS ? 'h-5' : 'h-[60px]'}`}>
                            <img src={image || favicon} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className={`bg-gray-50 rounded w-full flex items-center justify-center ${isXS ? 'h-5' : 'h-[30px]'}`}>
                            <ExternalLink className={`${isXS ? 'w-2.5 h-2.5' : 'w-4 h-4'} text-gray-300`} />
                        </div>
                    )}
                    {!isXS && (
                        <span className="text-[9px] text-gray-600 font-medium truncate w-full px-0.5 text-center leading-tight">
                            {siteName || title || "Link"}
                        </span>
                    )}
                </div>

            </NodeViewWrapper>
        )
    }

    // Rich preview - Block level, professional look (matching Image 1 inspiration)
    return (
        <NodeViewWrapper
            className={`${wrapperClass}`}
            data-drag-handle
            onMouseEnter={() => setShowHoverMenu(true)}
            onMouseLeave={() => setShowHoverMenu(false)}
            style={{ textAlign: node.attrs.textAlign }}
        >
            <div
                className={`group relative border rounded-xl overflow-hidden bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer ${size === 'm' ? 'max-w-[300px]' : 'max-w-2xl'} ${node.attrs.textAlign === 'center' ? 'mx-auto' : node.attrs.textAlign === 'right' ? 'ml-auto mr-0' : 'ml-0 mr-auto'} ${selected || editor.isActive('linkPreview') ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}
                onClick={handleClick}
            >
                {/* Top Section: Image/Logo area */}
                {showImage && (
                    <div className="aspect-[21/9] bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-200">
                        {image ? (
                            <img
                                src={image}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-500"
                                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('p-8') }}
                            />
                        ) : (
                            <div className="p-8 flex items-center justify-center">
                                {favicon ? (
                                    <img src={favicon} alt="" className="w-16 h-16 object-contain opacity-50" />
                                ) : (
                                    <ExternalLink className="w-12 h-12 text-gray-300" />
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom Section: Text content */}
                <div className="p-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                        <h3 className={`font-bold text-gray-900 truncate mb-0.5 ${size === 'm' ? 'text-sm' : 'text-base'}`}>
                            {title || (url ? new URL(url).hostname : '')}
                        </h3>
                        {siteName && (
                            <p className="text-xs text-gray-500 truncate">
                                {siteName}
                            </p>
                        )}
                    </div>

                    {/* Meta info / Action */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Unified Hover Toolbar - positioned relative to preview container */}
                {editor.isEditable && showHoverMenu && (
                    <div className="absolute bottom-2 right-2 bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex gap-1 z-20 animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <button
                            onClick={(e) => { e.stopPropagation(); updateAttributes({ textAlign: 'left' }) }}
                            className={`p-2 rounded transition-colors ${textAlign === 'left' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        >
                            <AlignLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); updateAttributes({ textAlign: 'center' }) }}
                            className={`p-2 rounded transition-colors ${textAlign === 'center' || !textAlign ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        >
                            <AlignCenter className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); updateAttributes({ textAlign: 'right' }) }}
                            className={`p-2 rounded transition-colors ${textAlign === 'right' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        >
                            <AlignRight className="w-4 h-4 text-gray-600" />
                        </button>

                        <div className="w-px h-6 bg-gray-200 mx-0.5" />

                        <button
                            onClick={(e) => { e.stopPropagation(); setSize('m') }}
                            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${size === 'm' ? 'bg-gray-100 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            Small
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setSize('full') }}
                            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${size === 'full' ? 'bg-gray-100 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            Full
                        </button>
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    )
}
