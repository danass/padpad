'use client'

import { useState, useEffect } from 'react'
import { FileText, ChevronLeft, ChevronRight, User, Calendar, Loader2 } from 'lucide-react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
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
import { Video } from '@/lib/editor/video-extension'
import { Audio } from '@/lib/editor/audio-extension'

function ArticleRenderer({ content, title, author, date }) {
    const editor = useEditor({
        editable: false,
        immediatelyRender: false,
        content: typeof content === 'string' ? JSON.parse(content) : content,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] },
                codeBlock: false,
            }),
            ResizableImage.configure({
                HTMLAttributes: { class: 'max-w-full h-auto rounded' },
            }),
            Youtube,
            TaskList,
            TaskItem,
            Details,
            DetailsSummary,
            DetailsContent,
            Link.configure({
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
            Video,
            Audio,
        ],
    })

    if (!editor) return null

    return (
        <article className="py-12 border-b border-gray-100 last:border-0">
            <header className="mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{title || 'Untitled'}</h2>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        {author.avatar ? (
                            <img src={author.avatar} alt={author.username} className="w-8 h-8 rounded-full border border-gray-100" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-400" />
                            </div>
                        )}
                        <span className="font-medium text-gray-900">@{author.username || 'anonymous'}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{date}</span>
                    </div>
                </div>
            </header>
            <div className="prose max-w-none">
                <EditorContent editor={editor} />
            </div>
        </article>
    )
}

export default function FeedClient({ initialData }) {
    const [articles, setArticles] = useState(initialData?.articles || [])
    const [pagination, setPagination] = useState(initialData?.pagination || null)
    const [loading, setLoading] = useState(!initialData)
    const [page, setPage] = useState(1)

    useEffect(() => {
        // Skip initial fetch if we already have data from the server
        if (initialData && page === 1 && articles.length > 0) {
            return
        }
        loadFeed(page)
    }, [page])

    const loadFeed = async (pageNum) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/feed?page=${pageNum}&limit=10`)
            if (response.ok) {
                const data = await response.json()
                setArticles(data.articles || [])
                setPagination(data.pagination)
                window.scrollTo(0, 0)
            }
        } catch (error) {
            console.error('Failed to load feed:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Content */}
            <main className="max-w-3xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-24">
                        <FileText className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400">No public articles yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-gray-100">
                            {articles.map((article) => (
                                <ArticleRenderer
                                    key={article.id}
                                    title={article.title}
                                    content={article.content_json}
                                    date={formatDate(article.updated_at)}
                                    author={{
                                        username: article.author_username,
                                        avatar: article.author_avatar
                                    }}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between gap-4 mt-16 pt-8 border-t">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={!pagination.hasPrev}
                                    className="flex items-center gap-2 text-sm font-medium disabled:opacity-30"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>

                                <div className="text-xs text-gray-400 uppercase tracking-widest">
                                    Page {pagination.page} / {pagination.totalPages}
                                </div>

                                <button
                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={!pagination.hasNext}
                                    className="flex items-center gap-2 text-sm font-medium disabled:opacity-30"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
