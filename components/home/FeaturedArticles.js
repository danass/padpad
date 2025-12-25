'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
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

// Single article renderer
function ArticleContent({ content }) {
    const editor = useEditor({
        editable: false,
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
            ResizableImage.configure({ HTMLAttributes: { class: 'max-w-full h-auto' } }),
            Youtube, TaskList, TaskItem, Details, DetailsSummary, DetailsContent,
            LinkExtension.configure({ openOnClick: true, HTMLAttributes: { class: 'text-blue-500 underline' } }),
            Underline, TextStyle, Color, Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Typography, FontFamily, FontSize, LineHeight, Drawing, LinkPreview,
            Emoji.configure({ enableEmoticons: true }),
        ],
        content: content,
    })

    if (!editor) return null
    return <EditorContent editor={editor} />
}

export default function FeaturedArticles() {
    const [articles, setArticles] = useState([])
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
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
            setLoaded(true)
        }
    }

    // No loader - just render nothing until loaded, then fade in
    if (!loaded || articles.length === 0) return null

    return (
        <section className="mt-16 border-t border-gray-200 pt-12 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured</h2>

            <div className="space-y-12">
                {articles.map((article) => (
                    <article key={article.id} className="border-b border-gray-100 pb-10 last:border-none">
                        {/* Header */}
                        <div className="mb-4">
                            {article.author?.username && (
                                <div className="flex items-center gap-2 mb-3">
                                    {article.author.avatarUrl ? (
                                        <img src={article.author.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-sm text-gray-500">{article.author.username.charAt(0).toUpperCase()}</span>
                                        </div>
                                    )}
                                    <span className="text-sm text-gray-600">@{article.author.username}</span>
                                    <span className="text-gray-300">·</span>
                                    <span className="text-sm text-gray-400">
                                        {new Date(article.featuredAt || article.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            <Link href={`/public/doc/${article.id}`}>
                                <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                    {article.title}
                                </h3>
                            </Link>
                        </div>

                        {/* Full content */}
                        <div className="prose max-w-none text-gray-700">
                            {article.content && <ArticleContent content={article.content} />}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}
