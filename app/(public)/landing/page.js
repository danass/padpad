'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import LinkExtension from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import CodeBlock from '@tiptap/extension-code-block'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Typography from '@tiptap/extension-typography'
import FontFamily from '@tiptap/extension-font-family'
import { FontSize } from '@/lib/editor/font-size-extension'
import { LineHeight } from '@/lib/editor/line-height-extension'
import { ResizableImage } from '@/lib/editor/resizable-image-extension'
import { Drawing } from '@/lib/editor/drawing-extension'
import { Youtube } from '@/lib/editor/youtube-extension'
import { TaskList, TaskItem } from '@/lib/editor/task-list-extension'
import { Details, DetailsSummary, DetailsContent } from '@/lib/editor/details-extension'
import { LinkPreview } from '@/lib/editor/link-preview-extension'
import Emoji from '@tiptap/extension-emoji'

// Single article component with its own editor
function ArticleRenderer({ content }) {
    const editor = useEditor({
        editable: false,
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] },
                codeBlock: false,
            }),
            Placeholder.configure({ placeholder: '' }),
            ResizableImage.configure({
                HTMLAttributes: { class: 'max-w-full h-auto' },
            }),
            Youtube,
            TaskList,
            TaskItem,
            Details,
            DetailsSummary,
            DetailsContent,
            LinkExtension.configure({
                openOnClick: true,
                HTMLAttributes: { class: 'text-blue-500 underline cursor-pointer' },
            }),
            Underline,
            Subscript,
            Superscript,
            CodeBlock.configure({
                HTMLAttributes: { class: 'bg-gray-100 rounded-md p-4 font-mono text-sm' },
            }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Typography,
            FontFamily,
            FontSize,
            LineHeight,
            Drawing,
            LinkPreview,
            Emoji.configure({ enableEmoticons: true }),
        ],
        content: content,
    })

    if (!editor) return null

    return <EditorContent editor={editor} />
}

export default function LandingPage() {
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        fetchFeatured()
    }, [])

    const fetchFeatured = async () => {
        try {
            const response = await fetch('/api/public/featured?limit=8')
            if (response.ok) {
                const data = await response.json()
                setArticles(data.documents || [])
            }
        } catch (error) {
            console.error('Error fetching featured:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Header */}
            <header className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 py-12 text-center">
                    <Link href="/" className="inline-block mb-6">
                        <img src="/padpad.svg" alt="Textpad" className="h-16 w-auto mx-auto" />
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Featured Articles
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Discover curated content from our community
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/drive"
                            className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Start Writing
                        </Link>
                        <Link
                            href="/featured"
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Browse All
                        </Link>
                    </div>
                </div>
            </header>

            {/* Featured Articles */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg mb-4">No featured articles yet.</p>
                        <Link
                            href="/drive"
                            className="text-blue-600 hover:underline"
                        >
                            Start creating your first document →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {articles.map((article) => (
                            <article key={article.id} className="border-b border-gray-100 pb-16 last:border-b-0">
                                {/* Article Header */}
                                <div className="mb-6">
                                    {/* Author info */}
                                    {article.author?.username && (
                                        <div className="flex items-center gap-3 mb-4">
                                            {article.author.avatarUrl ? (
                                                <img
                                                    src={article.author.avatarUrl}
                                                    alt={article.author.username}
                                                    className="w-10 h-10 rounded-full"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {article.author.username.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <Link
                                                    href={`/public/archive/${article.author.username}`}
                                                    className="font-medium text-gray-900 hover:text-blue-600"
                                                >
                                                    @{article.author.username}
                                                </Link>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(article.featuredAt || article.updatedAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Title */}
                                    <Link href={`/public/doc/${article.id}`}>
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                            {article.title}
                                        </h2>
                                    </Link>
                                </div>

                                {/* Article Content - Full */}
                                <div className="prose prose-lg max-w-none">
                                    {mounted && article.content && (
                                        <ArticleRenderer content={article.content} />
                                    )}
                                </div>

                                {/* Read more link */}
                                <div className="mt-8">
                                    <Link
                                        href={`/public/doc/${article.id}`}
                                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        View full article
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* See more link */}
                {articles.length > 0 && (
                    <div className="text-center mt-12">
                        <Link
                            href="/featured"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            See all featured articles
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <img src="/padpad.svg" alt="Textpad" className="h-6 w-6" />
                            <span className="text-gray-600">Textpad</span>
                        </div>
                        <nav className="flex gap-6 text-sm text-gray-500">
                            <Link href="/features" className="hover:text-gray-900">Features</Link>
                            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
                            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
                        </nav>
                    </div>
                </div>
            </footer>
        </div>
    )
}
