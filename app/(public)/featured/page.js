'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function FeaturedPage() {
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchArticles()
    }, [page])

    const fetchArticles = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/public/featured?limit=20&page=${page}`)
            if (response.ok) {
                const data = await response.json()
                setArticles(data.documents)
                setTotalPages(data.totalPages)
            }
        } catch (error) {
            console.error('Error fetching featured articles:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading && articles.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Featured Articles</h1>
                    <p className="text-gray-600">Discover our handpicked selection of outstanding content</p>
                </div>
            </header>

            {/* Articles Grid */}
            <main className="max-w-6xl mx-auto px-6 py-12">
                {articles.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">No featured articles yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/public/doc/${article.id}`}
                                    className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all"
                                >
                                    {/* Image */}
                                    {article.firstImage && (
                                        <div className="aspect-video bg-gray-100 overflow-hidden">
                                            <img
                                                src={article.firstImage}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="p-5">
                                        {/* Author */}
                                        {article.author?.username && (
                                            <div className="flex items-center gap-2 mb-3">
                                                {article.author.avatarUrl ? (
                                                    <img
                                                        src={article.author.avatarUrl}
                                                        alt={article.author.username}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-xs text-gray-500">
                                                            {article.author.username.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <span className="text-sm text-gray-500">@{article.author.username}</span>
                                            </div>
                                        )}

                                        {/* Title */}
                                        <h2 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {article.title}
                                        </h2>

                                        {/* Preview text */}
                                        {article.textPreview && (
                                            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                                                {article.textPreview}
                                            </p>
                                        )}

                                        {/* Date */}
                                        <p className="text-xs text-gray-400">
                                            {new Date(article.featuredAt || article.updatedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-gray-600">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
