'use client'

import { useState, useRef, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Volume2, VolumeX, Repeat, Trash2, Play, Pause } from 'lucide-react'

export default function AudioComponent({ node, updateAttributes, deleteNode }) {
    const { src, controls, loop, muted, autoplay } = node.attrs
    const [showMenu, setShowMenu] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const audioRef = useRef(null)
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
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleDelete = () => {
        deleteNode()
    }

    return (
        <NodeViewWrapper className="audio-node" ref={wrapperRef}>
            <div
                className={`relative inline-block w-full my-2 ${showMenu ? 'ring-2 ring-purple-500 rounded-lg' : ''}`}
                onClick={() => setShowMenu(true)}
            >
                {/* Context Menu */}
                {showMenu && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg flex items-center gap-1 p-1.5 z-10">
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

                {/* Audio Element */}
                <audio
                    ref={audioRef}
                    controls={controls}
                    loop={loop}
                    muted={muted}
                    autoPlay={autoplay}
                    preload="metadata"
                    crossOrigin="anonymous"
                    className="w-full rounded-lg"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                >
                    <source src={src} type={(() => {
                        if (!src) return undefined
                        const path = src.split(/[?#]/)[0].toLowerCase()
                        if (path.endsWith('.mp3')) return 'audio/mpeg'
                        if (path.endsWith('.wav')) return 'audio/wav'
                        if (path.endsWith('.ogg')) return 'audio/ogg'
                        if (path.endsWith('.m4a')) return 'audio/mp4'
                        return undefined
                    })()} />
                    Your browser does not support the audio tag.
                    <div className="mt-2 text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Unable to play audio in editor</p>
                        <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:underline flex items-center justify-center gap-1"
                        >
                            Open Direct Link
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </audio>
            </div>
        </NodeViewWrapper>
    )
}
