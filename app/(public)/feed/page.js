'use client'

import { useState, useEffect } from 'react'
import NextLink from 'next/link'
import { FileText, ChevronLeft, ChevronRight, User, Calendar, Loader2 } from 'lucide-react'

export default function FeedPage() {
    const [articles, setArticles] = useState([])
    const [pagination, setPagination] = useState(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)

    useEffect(() => {
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
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <NextLink href="/" className="flex items-center gap-2 text-gray-900 hover:text-gray-600">
                        <FileText className="w-6 h-6" />
                        <span className="font-semibold text-lg">Textpad</span>
                    </NextLink>
                    <h1 className="text-xl font-bold text-gray-900">Feed</h1>
                    <NextLink
                        href="/drive"
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                    >
                        My Drive
                    </NextLink>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Latest Publications</h2>
                    <p className="text-gray-600">Discover the newest articles from the community</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No articles yet</h3>
                        <p className="text-gray-500">Be the first to publish something!</p>
                    </div>
                ) : (
                    <>
                        {/* Articles Grid */}
                        <div className="space-y-4">
                            {articles.map((article) => (
                                <NextLink
                                    key={article.id}
                                    href={`/public/doc/${article.id}`}
                                    className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all"
                                >
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {article.title || 'Untitled'}
                                    </h3>

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        {/* Author */}
                                        <div className="flex items-center gap-2">
                                            {article.author_avatar ? (
                                                <img
                                                    src={article.author_avatar}
                                                    alt={article.author_name}
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                </div>
                                            )}
                                            <span>{article.author_username || article.author_name || 'Anonymous'}</span>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(article.updated_at)}</span>
                                        </div>
                                    </div>
                                </NextLink>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={!pagination.hasPrev}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        let pageNum
                                        if (pagination.totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (page <= 3) {
                                            pageNum = i + 1
                                        } else if (page >= pagination.totalPages - 2) {
                                            pageNum = pagination.totalPages - 4 + i
                                        } else {
                                            pageNum = page - 2 + i
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`w-10 h-10 rounded-lg text-sm font-medium ${page === pageNum
                                                        ? 'bg-black text-white'
                                                        : 'border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    })}
                                </div>

                                <button
                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={!pagination.hasNext}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Page Info */}
                        {pagination && (
                            <p className="text-center text-sm text-gray-500 mt-4">
                                Page {pagination.page} of {pagination.totalPages} • {pagination.total} articles
                            </p>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
