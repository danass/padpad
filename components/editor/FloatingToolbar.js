'use client'

import { Plus, HardDrive, Youtube, Code, Link } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function FloatingToolbar({ editor, onOpenIpfsBrowser }) {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    if (!editor) return null

    const handleAction = (callback) => {
        callback()
        setIsOpen(false)
    }

    return (
        <div className="flex items-center gap-2 relative left-[-52px] sm:left-[-60px] md:left-[-72px] z-[50]" ref={menuRef}>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(!isOpen)
                }}
                onMouseDown={(e) => e.preventDefault()} // Prevents loss of focus in editor
                className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all ${isOpen
                    ? 'rotate-45 border-gray-900 bg-white text-gray-900 opacity-100'
                    : 'border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900 bg-white shadow-sm opacity-80 hover:opacity-100'
                    }`}
                title="Add media or code"
            >
                <Plus className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="flex items-center gap-2 bg-white border border-gray-100 shadow-xl rounded-full px-2 py-1 absolute left-12 top-0 min-w-max animate-in fade-in slide-in-from-left-2 duration-200 z-[100]">
                    <button
                        onClick={() => handleAction(onOpenIpfsBrowser)}
                        onMouseDown={(e) => e.preventDefault()}
                        className="p-2 hover:bg-gray-50 rounded-full text-gray-600 hover:text-indigo-600 transition-colors"
                        title="Add Image"
                    >
                        <HardDrive className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => handleAction(() => {
                            // Dispatch event to show LinkEditor for video
                            const { view } = editor
                            const { state } = view
                            const { selection } = state
                            const { from } = selection
                            const coords = view.coordsAtPos(from)
                            const container = view.dom.closest('.prose') || view.dom.parentElement
                            const containerRect = container?.getBoundingClientRect()

                            if (containerRect) {
                                window.dispatchEvent(new CustomEvent('showLinkEditor', {
                                    detail: {
                                        position: {
                                            top: coords.bottom - containerRect.top + 8,
                                            left: coords.left - containerRect.left,
                                        },
                                        mode: 'video'
                                    }
                                }))
                            }
                        })}
                        onMouseDown={(e) => e.preventDefault()}
                        className="p-2 hover:bg-gray-50 rounded-full text-gray-600 hover:text-indigo-600 transition-colors"
                        title="Add Video"
                    >
                        <Youtube className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => handleAction(() => {
                            editor.chain().focus().toggleCodeBlock().run()
                        })}
                        onMouseDown={(e) => e.preventDefault()}
                        className="p-2 hover:bg-gray-50 rounded-full text-gray-600 hover:text-indigo-600 transition-colors"
                        title="Add Code Block"
                    >
                        <Code className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => handleAction(() => {
                            // Dispatch event to show LinkEditor for link preview
                            const { view } = editor
                            const { state } = view
                            const { selection } = state
                            const { from } = selection
                            const coords = view.coordsAtPos(from)
                            const container = view.dom.closest('.prose') || view.dom.parentElement
                            const containerRect = container?.getBoundingClientRect()

                            if (containerRect) {
                                window.dispatchEvent(new CustomEvent('showLinkEditor', {
                                    detail: {
                                        position: {
                                            top: coords.bottom - containerRect.top + 8,
                                            left: coords.left - containerRect.left,
                                        },
                                        mode: 'linkPreview'
                                    }
                                }))
                            }
                        })}
                        onMouseDown={(e) => e.preventDefault()}
                        className="p-2 hover:bg-gray-50 rounded-full text-gray-600 hover:text-indigo-600 transition-colors"
                        title="Add Link Preview"
                    >
                        <Link className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    )
}
