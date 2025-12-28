'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import NextLink from 'next/link'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
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
import { ChatConversation } from '@/lib/editor/chat-extension'
import { Video } from '@/lib/editor/video-extension'
import { Audio } from '@/lib/editor/audio-extension'
import Emoji from '@tiptap/extension-emoji'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function PublicDocumentClient({ serverData }) {
    const { t } = useLanguage()
    const [mounted, setMounted] = useState(false)

    // Extract data from serverData (passed from server component)
    const error = serverData?.error
    const docData = serverData?.document
    const content = serverData?.content
    const navigation = serverData?.navigation || { prev: null, next: null }

    const title = docData?.title || ''
    const isFullWidth = docData?.is_full_width || false
    const archiveId = docData?.archive_id
    const authorName = docData?.author_name

    const editor = useEditor({
        editable: false,
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
                codeBlock: false,
            }),
            Placeholder.configure({
                placeholder: '',
            }),
            ResizableImage.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto',
                },
            }),
            Youtube,
            TaskList,
            TaskItem,
            Details,
            DetailsSummary,
            DetailsContent,
            Link.configure({
                openOnClick: true,
                HTMLAttributes: {
                    class: 'text-blue-500 underline cursor-pointer',
                },
            }),
            Underline,
            Subscript,
            Superscript,
            CodeBlock.configure({
                HTMLAttributes: {
                    class: 'bg-gray-100 rounded-md p-4 font-mono text-sm',
                },
            }),
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Typography,
            FontFamily,
            FontSize,
            LineHeight,
            Drawing,
            LinkPreview,
            ChatConversation,
            Video,
            Audio,
            Emoji.configure({
                enableEmoticons: true,
            }),
        ],
        content: content || { type: 'doc', content: [] },
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    // Update editor content when it's ready
    useEffect(() => {
        if (editor && content && mounted) {
            editor.commands.setContent(content)
        }
    }, [editor, content, mounted])

    if (error) {
        const isServerError = error === 'server_error'
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <div className="text-center">
                        <div className="text-6xl mb-4">{isServerError ? '🔧' : '🔒'}</div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            {error === 'not_found'
                                ? (t?.documentNotFound || 'Document Not Found')
                                : isServerError
                                    ? 'Service temporarily unavailable'
                                    : (t?.accessDenied || 'Access Denied')}
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {error === 'not_found'
                                ? (t?.documentNotFoundDesc || 'The document you are looking for does not exist or has been deleted.')
                                : error === 'not_public'
                                    ? (t?.documentPrivate || 'This document is private and cannot be accessed publicly.')
                                    : isServerError
                                        ? "We've reached our database limit for this month. The service will be restored soon."
                                        : 'An error occurred while loading the document.'}
                        </p>
                        <a
                            href="/"
                            className="inline-block px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                        >
                            {t?.goHome || 'Go to Home'}
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {mounted && docData?.isOwner && docData?.id && (
                (() => {
                    const portalTarget = typeof window !== 'undefined' ? window.document.getElementById('header-actions') : null
                    if (!portalTarget) return null
                    return createPortal(
                        <NextLink
                            href={`/doc/${docData.id}`}
                            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            {t?.edit || 'Edit'}
                        </NextLink>,
                        portalTarget
                    )
                })()
            )}

            <div className={isFullWidth ? 'px-4 sm:px-6 py-12' : 'max-w-4xl mx-auto px-6 py-12'}>
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                    {title && title !== 'Untitled' ? title : (t?.untitledPad || 'Untitled Pad')}
                </h1>

                {/* Keywords/Tags */}
                {docData?.keywords && docData.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {docData.keywords.map((k) => (
                            <NextLink
                                key={k}
                                href={`/feed?keyword=${encodeURIComponent(k)}`}
                                className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full hover:bg-indigo-100 transition-colors"
                            >
                                #{k}
                            </NextLink>
                        ))}
                    </div>
                )}

                <div className="max-w-none">
                    {mounted && <EditorContent editor={editor} />}
                </div>

                {(navigation.prev || navigation.next || archiveId) && (
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="grid grid-cols-3 items-center">
                            <div className="flex justify-start">
                                {navigation.prev && (
                                    <NextLink
                                        href={`/public/doc/${navigation.prev.id}`}
                                        prefetch={false}
                                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group text-sm"
                                    >
                                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        <span className="truncate max-w-[100px] sm:max-w-[180px]">
                                            {navigation.prev.title || (t?.noTitle || 'Untitled')}
                                        </span>
                                    </NextLink>
                                )}
                            </div>

                            <div className="flex justify-center">
                                {archiveId && (
                                    <NextLink
                                        href={`/public/archive/${archiveId}`}
                                        prefetch={false}
                                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        <span>@{archiveId}</span>
                                    </NextLink>
                                )}
                            </div>

                            <div className="flex justify-end">
                                {navigation.next && (
                                    <NextLink
                                        href={`/public/doc/${navigation.next.id}`}
                                        prefetch={false}
                                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group text-sm"
                                    >
                                        <span className="truncate max-w-[100px] sm:max-w-[180px]">
                                            {navigation.next.title || (t?.noTitle || 'Untitled')}
                                        </span>
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </NextLink>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    )
}
