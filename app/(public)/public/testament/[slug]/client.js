'use client'

import { format } from 'date-fns'
import Link from 'next/link'

export default function TestamentClient({ initialData }) {
    const { documents = [], age99Date } = initialData || {}

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12 text-center border-b border-gray-200 pb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Digital Testament</h1>
                    {age99Date && (() => {
                        const date = new Date(age99Date)
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const age99DateOnly = new Date(date)
                        age99DateOnly.setHours(0, 0, 0, 0)
                        const isPast = today >= age99DateOnly
                        return (
                            <p className="text-sm text-gray-500">
                                Documents {isPast ? 'became' : 'will become'} public on {format(date, 'MMMM d, yyyy')}
                            </p>
                        )
                    })()}
                </div>

                {/* Documents List */}
                {documents.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No documents available yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                Documents ({documents.length})
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {documents.map((doc) => (
                                <Link
                                    key={doc.id}
                                    href={`/public/doc/${doc.id}`}
                                    prefetch={false}
                                    className="block border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                {doc.title || 'Untitled'}
                                            </h3>
                                            {doc.content_text && (
                                                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                                                    {doc.content_text.substring(0, 200)}
                                                    {doc.content_text.length > 200 ? '...' : ''}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>
                                                    Created: {format(new Date(doc.created_at), 'MMM d, yyyy')}
                                                </span>
                                                <span>
                                                    Updated: {format(new Date(doc.updated_at), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
