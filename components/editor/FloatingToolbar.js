'use client'

import { Plus, Image, Video, Code, Link } from 'lucide-react'
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
        <div className="hidden md:flex items-center gap-2 relative left-[-48px]" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all ${isOpen
                    ? 'rotate-45 border-gray-900 bg-white text-gray-900'
                    : 'border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900 bg-white shadow-sm'
                    }`}
                title="Add media or code"
            >
                <Plus className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="flex items-center gap-2 bg-white border border-gray-100 shadow-xl rounded-full px-2 py-1 absolute left-12 top-0 min-w-max animate-in fade-in slide-in-from-left-2 duration-200 z-[100]">
                    <button
                        onClick={() => handleAction(onOpenIpfsBrowser)}
                        className="p-2 hover:bg-gray-50 rounded-full text-gray-600 hover:text-indigo-600 transition-colors"
                        title="Add Image"
                    >
                        <Image className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => handleAction(() => {
                            const url = window.prompt('Enter video URL (YouTube, Vimeo, etc.)')
                            if (url) {
                                editor.chain().focus().setVideo({ src: url }).run()
                            }
                        })}
                        className="p-2 hover:bg-gray-50 rounded-full text-gray-600 hover:text-indigo-600 transition-colors"
                        title="Add Video"
                    >
                        <Video className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => handleAction(() => {
                            editor.chain().focus().toggleCodeBlock().run()
                        })}
                        className="p-2 hover:bg-gray-50 rounded-full text-gray-600 hover:text-indigo-600 transition-colors"
                        title="Add Code Block"
                    >
                        <Code className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => handleAction(() => {
                            const url = window.prompt('Enter URL for link preview')
                            if (url) {
                                editor.chain().focus().setLinkPreview({ url }).run()
                            }
                        })}
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
