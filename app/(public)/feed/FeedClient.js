'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import NextLink from 'next/link'
import { FileText, ChevronLeft, ChevronRight, User, Calendar, Loader2, Tag, X } from 'lucide-react'
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

function ArticleRenderer({ id, content, title, author, date, keywords }) {
    const [mounted, setMounted] = useState(false)
    const editor = useEditor({
        editable: false,
        immediatelyRender: false,
        content: content || { type: 'doc', content: [] },
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
                HTMLAttributes: { class: 'text-cyan-600 underline cursor-pointer' },
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

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (editor && content && mounted) {
            editor.commands.setContent(content)
        }
    }, [editor, content, mounted])

    if (!editor) return null

    return (
        <article className="py-8 border-b border-gray-100 last:border-0">
            <header className="mb-6">
                <div className="flex flex-wrap gap-2 mb-3">
                    {keywords && keywords.map(tag => (
                        <NextLink
                            key={tag}
                            href={`/feed?keyword=${encodeURIComponent(tag)}`}
                            className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full hover:bg-gray-200 transition-colors"
                        >
                            #{tag}
                        </NextLink>
                    ))}
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                    <NextLink href={`/public/doc/${id}`}>{title || 'Untitled'}</NextLink>
                </h2>

                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        {author.avatar ? (
                            <img src={author.avatar} alt={author.username} className="w-8 h-8 rounded-full border border-gray-100" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-400" />
                            </div>
                        )}
                        <NextLink
                            href={`/public/archive/${author.username || author.archive_id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                            @{author.username || author.archive_id || 'anonymous'}
                        </NextLink>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{date}</span>
                    </div>
                </div>
            </header>
            <div className="prose max-w-none">
                {mounted && <EditorContent editor={editor} />}
            </div>
        </article>
    )
}

export default function FeedClient({ initialData, initialKeyword }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [articles, setArticles] = useState(initialData?.articles || [])
    const [allKeywords, setAllKeywords] = useState(initialData?.allKeywords || [])
    const [pagination, setPagination] = useState(initialData?.pagination || null)
    const [loading, setLoading] = useState(false)
    const [keyword, setKeyword] = useState(initialKeyword || null)
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))

    // Update internal state if searchParams change
    useEffect(() => {
        const k = searchParams.get('keyword')
        const p = parseInt(searchParams.get('page') || '1')

        // Only trigger if params actually changed
        if (k !== keyword || p !== page) {
            setKeyword(k)
            setPage(p)
            loadFeed(p, k)
        }
    }, [searchParams])

    const loadFeed = async (pageNum, kw) => {
        setLoading(true)
        try {
            const url = new URL('/api/feed', window.location.origin)
            url.searchParams.set('page', pageNum)
            url.searchParams.set('limit', 10)
            if (kw) url.searchParams.set('keyword', kw)

            const response = await fetch(url.toString())
            if (response.ok) {
                const data = await response.json()
                setArticles(data.articles || [])
                setAllKeywords(data.allKeywords || [])
                setPagination(data.pagination)
                window.scrollTo(0, 0)
            }
        } catch (error) {
            console.error('Failed to load feed:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', newPage)
        router.push(`/feed?${params.toString()}`)
    }

    const handleKeywordChange = (newKeyword) => {
        const params = new URLSearchParams()
        if (newKeyword) params.set('keyword', newKeyword)
        params.set('page', '1')
        router.push(`/feed?${params.toString()}`)
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
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
                    {keyword && (
                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium flex items-center gap-2">
                            #{keyword}
                            <button onClick={() => handleKeywordChange(null)} className="hover:text-blue-800">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Keyword Filter UI */}
                {allKeywords.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-500">
                            <Tag className="w-4 h-4" />
                            <span>Filter by tag</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {allKeywords.map(kw => (
                                <button
                                    key={kw}
                                    onClick={() => handleKeywordChange(kw === keyword ? null : kw)}
                                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${kw === keyword
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    #{kw}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                        <FileText className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400">No public articles found {keyword ? `for #${keyword}` : ''}.</p>
                        {keyword && (
                            <button
                                onClick={() => handleKeywordChange(null)}
                                className="mt-4 text-sm text-blue-600 font-medium hover:underline"
                            >
                                View all articles
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-gray-100">
                            {articles.map((article) => (
                                <ArticleRenderer
                                    key={article.id}
                                    id={article.id}
                                    title={article.title}
                                    content={article.content_json}
                                    keywords={article.keywords}
                                    date={formatDate(article.updated_at)}
                                    author={{
                                        username: article.author_username,
                                        avatar: article.author_avatar,
                                        archive_id: article.author_archive_id
                                    }}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between gap-4 mt-16 pt-8 border-t">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                                    disabled={!pagination.hasPrev}
                                    className="flex items-center gap-2 text-sm font-medium disabled:opacity-30 group"
                                >
                                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                    Previous
                                </button>

                                <div className="text-xs text-gray-400 font-mono">
                                    {pagination.page} / {pagination.totalPages}
                                </div>

                                <button
                                    onClick={() => handlePageChange(Math.min(pagination.totalPages, page + 1))}
                                    disabled={!pagination.hasNext}
                                    className="flex items-center gap-2 text-sm font-medium disabled:opacity-30 group"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
