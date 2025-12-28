'use client'

import {
    Bold,
    Italic,
    Link as LinkIcon,
    Type,
    Quote,
    Heading1,
    Heading2
} from 'lucide-react'

export default function BubbleToolbar({ editor, onOpenLink }) {
    if (!editor) return null

    const isBold = editor.isActive('bold')
    const isItalic = editor.isActive('italic')
    const isLink = editor.isActive('link')
    const isH1 = editor.isActive('heading', { level: 1 })
    const isH2 = editor.isActive('heading', { level: 2 })
    const isQuote = editor.isActive('blockquote')

    return (
        <div className="flex items-center bg-gray-900 text-white rounded-lg shadow-xl px-1 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${isBold ? 'text-blue-400' : 'text-gray-200'}`}
                title="Bold"
            >
                <Bold className="w-4 h-4" />
            </button>

            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${isItalic ? 'text-blue-400' : 'text-gray-200'}`}
                title="Italic"
            >
                <Italic className="w-4 h-4" />
            </button>

            <div className="hidden xs:block">
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (isLink) {
                            editor.chain().focus().unsetLink().run()
                        } else {
                            onOpenLink('link')
                        }
                    }}
                    className={`p-2 hover:bg-gray-800 rounded transition-colors ${isLink ? 'text-blue-400' : 'text-gray-200'}`}
                    title="Link"
                >
                    <LinkIcon className="w-4 h-4" />
                </button>
            </div>

            <div className="w-px h-4 bg-gray-700 mx-1" />

            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${isH1 ? 'text-blue-400' : 'text-gray-200'}`}
                title="Large Heading"
            >
                <Heading1 className="w-4 h-4" />
            </button>

            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${isH2 ? 'text-blue-400' : 'text-gray-200'}`}
                title="Small Heading"
            >
                <Heading2 className="w-4 h-4" />
            </button>

            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 hover:bg-gray-800 rounded transition-colors ${isQuote ? 'text-blue-400' : 'text-gray-200'}`}
                title="Quote"
            >
                <Quote className="w-4 h-4" />
            </button>
        </div>
    )
}
