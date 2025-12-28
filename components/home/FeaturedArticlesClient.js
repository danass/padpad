'use client'

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

// Extract text from TipTap JSON content
function extractTextFromContent(content) {
    if (!content) return ''

    const extractText = (node) => {
        if (!node) return ''
        if (typeof node === 'string') return node
        if (node.text) return node.text
        if (node.content && Array.isArray(node.content)) {
            return node.content.map(extractText).join(' ')
        }
        return ''
    }

    return extractText(content).trim()
}

// Get display title - only show if it's a real title (not "Untitled")
function getDisplayTitle(article) {
    const hasRealTitle = article.title && article.title !== 'Untitled' && article.title.trim() !== ''

    if (hasRealTitle) {
        return article.title
    }

    return null
}

function ArticleContent({ content }) {
    const editor = useEditor({
        editable: false,
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] },
                codeBlock: false,
            }),
            ResizableImage.configure({ HTMLAttributes: { class: 'max-w-full h-auto' } }),
            Youtube, TaskList, TaskItem, Details, DetailsSummary, DetailsContent,
            LinkExtension.configure({ openOnClick: true, HTMLAttributes: { class: 'text-cyan-600 underline' } }),
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

export default function FeaturedArticlesClient({ articles = [] }) {
    if (articles.length === 0) return null

    return (
        <section className="mt-16 border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured</h2>

            <div className="space-y-12">
                {articles.map((article) => {
                    const displayTitle = getDisplayTitle(article)
                    const isFullWidth = article.isFullWidth || false

                    return (
                        <article
                            key={article.id}
                            className={`border-b border-gray-100 pb-10 last:border-none ${isFullWidth ? '-mx-4 md:-mx-6 px-4 md:px-6' : ''}`}
                        >
                            <div className="mb-4">
                                {(article.author?.username || article.author?.archiveId) && (
                                    <div className="flex items-center gap-2 mb-3">
                                        <Link
                                            href={`/public/archive/${article.author.username || article.author.archiveId}`}
                                            className="flex items-center gap-2 group/author"
                                        >
                                            {article.author.avatarUrl ? (
                                                <img src={article.author.avatarUrl} alt="" className="w-8 h-8 rounded-full transition-transform group-hover/author:scale-110" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center transition-transform group-hover/author:scale-110">
                                                    <span className="text-sm text-gray-500">
                                                        {(article.author.username || article.author.archiveId || '?').charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <span className="text-sm text-gray-600 group-hover/author:text-black transition-colors font-medium">
                                                @{article.author.username || article.author.archiveId}
                                            </span>
                                        </Link>
                                        <span className="text-gray-300">·</span>
                                        <span className="text-sm text-gray-400">
                                            {new Date(article.featuredAt || article.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                {/* Only show title if we have one */}
                                {displayTitle && (
                                    <Link href={`/public/doc/${article.id}`}>
                                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                            {displayTitle}
                                        </h3>
                                    </Link>
                                )}
                            </div>

                            <div className={`prose text-gray-700 ${isFullWidth ? 'max-w-none' : 'max-w-none'}`}>
                                {article.content && <ArticleContent content={article.content} />}
                            </div>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}
