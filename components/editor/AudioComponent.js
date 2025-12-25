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
                    src={src}
                    controls={controls}
                    loop={loop}
                    muted={muted}
                    autoPlay={autoplay}
                    className="w-full rounded-lg"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                />
            </div>
        </NodeViewWrapper>
    )
}
