'use client'

import Link from 'next/link'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function FeaturedClient({ articles, allKeywords, totalPages, page, keyword }) {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {t?.home || 'Home'}
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{t?.navFeatured || 'Featured'}</h1>
                </div>
            </header>

            {/* Articles Grid */}
            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Keyword Filters */}
                {allKeywords && allKeywords.length > 0 && (
                    <div className="mb-8">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm text-gray-500 mr-2">{t?.filterBy || 'Filter by:'}</span>
                            <Link
                                href="/featured"
                                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${!keyword ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                {t?.all || 'All'}
                            </Link>
                            {allKeywords.map((k) => (
                                <Link
                                    key={k}
                                    href={`/featured?keyword=${encodeURIComponent(k)}`}
                                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${keyword === k ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    {k}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {articles.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">
                            {keyword
                                ? (t?.noResultsWithKeyword || 'No results found for #{keyword}').replace('{keyword}', keyword)
                                : (t?.noResults || 'No results found')
                            }
                        </p>
                        {keyword && (
                            <Link href="/featured" className="text-blue-600 hover:underline mt-2 inline-block">
                                {t?.clearFilter || 'Clear filter'}
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/public/doc/${article.id}`}
                                    prefetch={false}
                                    className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all"
                                >
                                    {/* Image */}
                                    {article.firstImage && (
                                        <div className="aspect-video bg-gray-50 overflow-hidden">
                                            <img
                                                src={article.firstImage}
                                                alt={article.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="p-5">
                                        {/* Author */}
                                        {(article.author?.username || article.author?.archive_id) && (
                                            <div className="flex items-center gap-2 mb-3">
                                                {article.author.avatarUrl ? (
                                                    <img
                                                        src={article.author.avatarUrl}
                                                        alt={article.author.username || article.author.archive_id}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-xs text-gray-500">
                                                            {(article.author.username || article.author.archive_id || '?').charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <span className="text-sm text-gray-500">@{article.author.username || article.author.archive_id}</span>
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

                                        {/* Keywords */}
                                        {article.keywords && article.keywords.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {article.keywords.slice(0, 3).map((k) => (
                                                    <Link
                                                        key={k}
                                                        href={`/feed?keyword=${encodeURIComponent(k)}`}
                                                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {k}
                                                    </Link>
                                                ))}
                                                {article.keywords.length > 3 && (
                                                    <span className="text-xs text-gray-400">+{article.keywords.length - 3}</span>
                                                )}
                                            </div>
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
                                <Link
                                    href={`/featured?page=${Math.max(1, page - 1)}${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''}`}
                                    className={`px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 ${page === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    {t?.previous || 'Previous'}
                                </Link>
                                <span className="px-4 py-2 text-gray-600">
                                    {(t?.pageOf || 'Page {current} of {total}').replace('{current}', page).replace('{total}', totalPages)}
                                </span>
                                <Link
                                    href={`/featured?page=${Math.min(totalPages, page + 1)}${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''}`}
                                    className={`px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 ${page === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    {t?.next || 'Next'}
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
