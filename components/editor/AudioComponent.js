'use client'

import { useState, useRef, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Volume2, VolumeX, Repeat, Trash2, Play, Pause, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

export default function AudioComponent({ node, updateAttributes, deleteNode, editor, getPos }) {
    const { src, controls, loop, muted, autoplay, align } = node.attrs
    const [showHoverMenu, setShowHoverMenu] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const audioRef = useRef(null)
    const wrapperRef = useRef(null)

    // Simplified: local menu removed for unified toolbar
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
                className={`relative inline-block w-full my-4 group transition-all ${editor?.isEditable ? 'hover:ring-2 hover:ring-blue-400' : ''} ${editor?.isActive('audio') ? 'ring-2 ring-blue-500 ring-offset-2' : ''} rounded-lg`}
                onMouseEnter={() => setShowHoverMenu(true)}
                onMouseLeave={() => setShowHoverMenu(false)}
                onClick={(e) => {
                    if (editor?.isEditable && typeof getPos === 'function') {
                        // Prevent default to avoid browser play/pause if clicking on non-controls area
                        e.stopPropagation()
                        editor.chain().focus().setNodeSelection(getPos()).run()
                    }
                }}
                onContextMenu={(e) => {
                    if (editor?.isEditable && typeof getPos === 'function') {
                        editor.chain().focus().setNodeSelection(getPos()).run()
                    }
                }}
            >
                {/* Unified Hover Toolbar - Disabled for now
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
                            onClick={(e) => { e.stopPropagation(); updateAttributes({ loop: !loop }) }}
                            className={`p-2 rounded transition-colors ${loop ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'}`}
                            title="Loop"
                        >
                            <Repeat className="w-4 h-4" />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); updateAttributes({ muted: !muted }) }}
                            className={`p-2 rounded transition-colors ${muted ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'}`}
                            title="Mute"
                        >
                            <VolumeX className="w-4 h-4" />
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
                */}

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
