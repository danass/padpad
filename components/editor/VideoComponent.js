'use client'

import { useState, useRef, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Volume2, VolumeX, Repeat, Trash2, Play, Pause, Maximize2, Minimize2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

export default function VideoComponent({ node, updateAttributes, deleteNode, editor, getPos }) {
    const { src, controls, loop, muted, autoplay, width, align } = node.attrs
    const [showHoverMenu, setShowHoverMenu] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const videoRef = useRef(null)
    const wrapperRef = useRef(null)

    const handleTogglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleSizePreset = (preset) => {
        const sizes = { small: 300, medium: 500, large: 700, full: null }
        updateAttributes({ width: sizes[preset] })
    }

    const handleDelete = () => {
        deleteNode()
    }

    // Helper to extract YouTube/Vimeo ID
    const getEmbedUrl = (url) => {
        if (!url) return null

        // YouTube
        const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`

        // Vimeo
        const vMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/)
        if (vMatch) return `https://player.vimeo.com/video/${vMatch[1]}`

        return null
    }

    const embedUrl = getEmbedUrl(src)
    const isYoutube = src?.includes('youtube.com') || src?.includes('youtu.be')
    const isVimeo = src?.includes('vimeo.com')
    const alignClass = align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto'

    return (
        <NodeViewWrapper className="video-node" ref={wrapperRef}>
            <div
                className="relative my-4 group"
                style={{
                    width: width ? `${width}px` : '100%',
                    maxWidth: '100%',
                    marginLeft: align === 'center' || !align ? 'auto' : align === 'right' ? 'auto' : '0',
                    marginRight: align === 'center' || !align ? 'auto' : align === 'left' ? 'auto' : '0'
                }}
                onMouseEnter={() => setShowHoverMenu(true)}
                onMouseLeave={() => setShowHoverMenu(false)}
            >
                {/* Branding Indicator (Only in Edit Mode) */}
                {editor?.isEditable && (embedUrl || src) && (
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {isYoutube ? (
                            <div className="flex items-center gap-1">
                                <span className="text-[#FF0000]">●</span>
                                <span>YOUTUBE</span>
                            </div>
                        ) : isVimeo ? (
                            <div className="flex items-center gap-1">
                                <span className="text-[#1AB7EA]">●</span>
                                <span>VIMEO</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <Volume2 className="w-3 h-3" />
                                <span>VIDEO</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Video Content */}
                {embedUrl ? (
                    <div
                        className={`aspect-video rounded-lg overflow-hidden bg-black shadow-md ${alignClass} transition-all ${editor?.isEditable ? 'group-hover:ring-2 group-hover:ring-blue-400' : ''} ${editor?.isEditable && editor?.isActive(node.type.name) ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                        style={{ width: width ? `${width}px` : '100%', maxWidth: '100%' }}
                    >
                        <iframe
                            src={embedUrl}
                            className={`w-full h-full border-0 ${editor?.isEditable ? 'pointer-events-none' : 'pointer-events-auto'}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                        {/* Overlay to catch clicks in editor - ONLY in Edit Mode */}
                        {editor?.isEditable && (
                            <div
                                className="absolute inset-0 z-10 cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    // Focus and select the video node
                                    if (typeof getPos === 'function') {
                                        const pos = getPos()
                                        editor.chain().focus().setNodeSelection(pos).run()
                                    }
                                }}
                                onContextMenu={(e) => {
                                    if (typeof getPos === 'function') {
                                        const pos = getPos()
                                        editor.chain().focus().setNodeSelection(pos).run()
                                    }
                                }}
                            />
                        )}
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        controls={controls}
                        loop={loop}
                        muted={muted}
                        autoPlay={autoplay}
                        playsInline
                        preload="metadata"
                        crossOrigin="anonymous"
                        className={`rounded-lg ${alignClass} bg-black shadow-md transition-all ${editor?.isEditable ? 'group-hover:ring-2 group-hover:ring-blue-400' : ''} ${editor?.isEditable && editor?.isActive(node.type.name) ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                        style={{ maxWidth: '100%', width: width ? `${width}px` : '100%', minHeight: '100px' }}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        onClick={(e) => {
                            if (!editor?.isEditable) return
                            e.preventDefault()
                            e.stopPropagation()
                            if (typeof getPos === 'function') {
                                const pos = getPos()
                                editor.chain().focus().setNodeSelection(pos).run()
                            }
                        }}
                        onContextMenu={(e) => {
                            if (!editor?.isEditable) return
                            if (typeof getPos === 'function') {
                                const pos = getPos()
                                editor.chain().focus().setNodeSelection(pos).run()
                            }
                        }}
                        onError={(e) => {
                            const video = e.target
                            const error = video.error

                            // Ignore errors during initial mount when element isn't ready
                            if (!error || !error.code) {
                                return
                            }

                            console.error('Video error details:', {
                                src: src,
                                errorCode: error.code,
                                errorMessage: error.message,
                                networkState: video.networkState,
                                readyState: video.readyState,
                                // Error codes: 1=ABORTED, 2=NETWORK, 3=DECODE, 4=SRC_NOT_SUPPORTED
                                errorType: error.code === 1 ? 'MEDIA_ERR_ABORTED' :
                                    error.code === 2 ? 'MEDIA_ERR_NETWORK' :
                                        error.code === 3 ? 'MEDIA_ERR_DECODE' :
                                            error.code === 4 ? 'MEDIA_ERR_SRC_NOT_SUPPORTED' : 'UNKNOWN'
                            })
                        }}
                    >
                        <source src={src} type={(() => {
                            if (!src) return undefined
                            const path = src.split(/[?#]/)[0].toLowerCase()
                            if (path.endsWith('.mp4')) return 'video/mp4'
                            if (path.endsWith('.webm')) return 'video/webm'
                            if (path.endsWith('.ogg')) return 'video/ogg'
                            if (path.endsWith('.mov')) return 'video/quicktime'
                            return undefined
                        })()} />
                        Your browser does not support the video tag.
                    </video>
                )}

                {/* Hover menu */}
                {editor?.isEditable && showHoverMenu && (
                    <div className="absolute bottom-2 right-2 bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex gap-1 z-20 animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <button
                            onClick={(e) => { e.stopPropagation(); updateAttributes({ align: 'left' }) }}
                            className={`p-2 rounded transition-colors ${align === 'left' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        >
                            <AlignLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); updateAttributes({ align: 'center' }) }}
                            className={`p-2 rounded transition-colors ${align === 'center' || !align ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        >
                            <AlignCenter className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); updateAttributes({ align: 'right' }) }}
                            className={`p-2 rounded transition-colors ${align === 'right' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        >
                            <AlignRight className="w-4 h-4 text-gray-600" />
                        </button>

                        <div className="w-px h-6 bg-gray-200 mx-0.5" />

                        <button
                            onClick={(e) => { e.stopPropagation(); updateAttributes({ width: 300 }) }}
                            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${width === 300 ? 'bg-gray-100 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            Small
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); updateAttributes({ width: null }) }}
                            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${!width ? 'bg-gray-100 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            Full
                        </button>

                        <div className="w-px h-6 bg-gray-200 mx-0.5" />

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                deleteNode()
                            }}
                            className="p-2 hover:bg-red-50 text-red-500 rounded transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    )
}
