'use client'

import { useState, useRef, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Volume2, VolumeX, Repeat, Trash2, Play, Pause, Maximize2, Minimize2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

export default function VideoComponent({ node, updateAttributes, deleteNode }) {
    const { src, controls, loop, muted, autoplay, width, align } = node.attrs
    const [showMenu, setShowMenu] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const videoRef = useRef(null)
    const wrapperRef = useRef(null)

    // Click outside to close menu
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

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

    // Determine alignment classes
    const alignClass = align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto'

    return (
        <NodeViewWrapper className="video-node" ref={wrapperRef}>
            <div
                className={`relative my-2 ${showMenu ? 'ring-2 ring-purple-500 rounded-lg' : ''}`}
                style={{ width: width ? `${width}px` : '100%' }}
                onClick={() => setShowMenu(true)}
            >
                {/* Context Menu */}
                {showMenu && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg flex items-center gap-1 p-1.5 z-10 flex-wrap justify-center">
                        {/* Play/Pause */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleTogglePlay() }}
                            className="p-1.5 hover:bg-gray-100 rounded"
                            title={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>

                        <div className="w-px h-5 bg-gray-200" />

                        {/* Loop */}
                        <button
                            onClick={(e) => { e.stopPropagation(); updateAttributes({ loop: !loop }) }}
                            className={`p-1.5 rounded ${loop ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100'}`}
                            title="Loop"
                        >
                            <Repeat className="w-4 h-4" />
                        </button>

                        {/* Muted */}
                        <button
                            onClick={(e) => { e.stopPropagation(); updateAttributes({ muted: !muted }) }}
                            className={`p-1.5 rounded ${muted ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}`}
                            title={muted ? 'Unmute' : 'Mute'}
                        >
                            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>

                        {/* Controls toggle */}
                        <button
                            onClick={(e) => { e.stopPropagation(); updateAttributes({ controls: !controls }) }}
                            className={`p-1.5 rounded text-xs font-medium ${controls ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                            title="Show/hide controls"
                        >
                            Bar
                        </button>

                        <div className="w-px h-5 bg-gray-200" />

                        {/* Size presets */}
                        <button onClick={(e) => { e.stopPropagation(); handleSizePreset('small') }} className={`p-1.5 rounded text-xs ${width === 300 ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="Small">
                            <Minimize2 className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleSizePreset('full') }} className={`p-1.5 rounded text-xs ${!width ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="Full width">
                            <Maximize2 className="w-4 h-4" />
                        </button>

                        <div className="w-px h-5 bg-gray-200" />

                        {/* Alignment */}
                        <button onClick={(e) => { e.stopPropagation(); updateAttributes({ align: 'left' }) }} className={`p-1.5 rounded ${align === 'left' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="Align left">
                            <AlignLeft className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); updateAttributes({ align: 'center' }) }} className={`p-1.5 rounded ${align === 'center' || !align ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="Center">
                            <AlignCenter className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); updateAttributes({ align: 'right' }) }} className={`p-1.5 rounded ${align === 'right' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="Align right">
                            <AlignRight className="w-4 h-4" />
                        </button>

                        <div className="w-px h-5 bg-gray-200" />

                        {/* Delete */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete() }}
                            className="p-1.5 hover:bg-red-100 text-red-500 rounded"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Video Element */}
                <video
                    ref={videoRef}
                    controls={controls}
                    loop={loop}
                    muted={muted}
                    autoPlay={autoplay}
                    playsInline
                    preload="metadata"
                    crossOrigin="anonymous"
                    className={`rounded-lg ${alignClass} bg-black`}
                    style={{ maxWidth: '100%', width: width ? `${width}px` : '100%', minHeight: '100px' }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onError={(e) => {
                        console.error('Video error:', e)
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center rounded-lg">
                        <p className="text-sm mb-2 text-gray-400">Unable to play video in editor</p>
                        <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center gap-1.5"
                        >
                            Open Direct Link
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </video>
            </div>
        </NodeViewWrapper>
    )
}
