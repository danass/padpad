'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import GoogleDocsToolbar from '@/components/editor/GoogleDocsToolbar'
import ContextMenu from '@/components/editor/ContextMenu'
import LinkEditor from '@/components/editor/LinkEditor'

export default function TempPadClient({ serverData }) {
    const { data: session } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { t } = useLanguage()
    const [mounted, setMounted] = useState(false)
    const [claiming, setClaiming] = useState(false)
    const [linkEditorPosition, setLinkEditorPosition] = useState(null)
    const [isSaving, setIsSaving] = useState(false)

    const document = serverData?.document
    const initialContent = serverData?.content
    const error = serverData?.error

    const editor = useEditor({
        editable: true,
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] },
                codeBlock: false,
            }),
            Placeholder.configure({ placeholder: t?.editorPlaceholder || 'Start writing...' }),
            ResizableImage,
            Youtube,
            TaskList,
            TaskItem,
            Details,
            DetailsSummary,
            DetailsContent,
            Link.configure({
                openOnClick: false,
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
            ChatConversation,
            Video,
            Audio,
            Emoji.configure({ enableEmoticons: true }),
        ],
        content: initialContent || { type: 'doc', content: [] },
        onUpdate: ({ editor }) => {
            debouncedSave(editor.getJSON())
        }
    })

    // Debounced save for snapshots
    const debouncedSave = useCallback(
        (() => {
            let timeout
            return (content) => {
                clearTimeout(timeout)
                timeout = setTimeout(async () => {
                    if (!document?.id) return
                    setIsSaving(true)
                    try {
                        await fetch(`/api/documents/${document.id}/snapshot`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content_json: content }),
                        })
                    } catch (err) {
                        console.error('Error saving snapshot:', err)
                    } finally {
                        setIsSaving(false)
                    }
                }, 2000)
            }
        })(),
        [document?.id]
    )

    useEffect(() => {
        setMounted(true)
    }, [])

    // Use a ref to ensure we only try to claim once per mount
    const claimAttempted = useRef(false)

    // Handle claim query param after login
    useEffect(() => {
        if (mounted && session && searchParams.get('claim') === 'true' && document?.id && !claiming && !claimAttempted.current) {
            handleClaim()
        }
    }, [mounted, session, searchParams, document?.id, claiming])

    const handleClaim = async () => {
        if (!session) {
            // Redirect to login with claim=true callback
            const callbackUrl = `${window.location.origin}/public/temp/${document.id}?claim=true`
            signIn('google', { callbackUrl })
            return
        }

        if (claimAttempted.current) return
        claimAttempted.current = true

        setClaiming(true)
        try {
            const res = await fetch(`/api/documents/${document.id}/claim`, {
                method: 'POST',
            })
            if (res.ok) {
                const data = await res.json()
                // Use window.location.href for a clean redirect
                window.location.href = `/doc/${data.document.id}`
            } else {
                // If we're already navigating away, don't show the alert
                const errorData = await res.json().catch(() => ({}))
                alert(`Failed to claim document: ${errorData.error || res.statusText}`)
            }
        } catch (err) {
            console.error('Error claiming document:', err)
            // Only alert if we're not likely navigating
            if (typeof window !== 'undefined' && !window.document.hidden) {
                alert('Error claiming document')
            }
        } finally {
            // Don't set claiming to false if successful to avoid re-triggering effect
            // Actually with the ref it's safe either way, but let's be clean
            setClaiming(false)
        }
    }

    // Listen for showLinkEditor event
    useEffect(() => {
        const handleShowLinkEditor = (e) => setLinkEditorPosition(e.detail.position)
        window.addEventListener('showLinkEditor', handleShowLinkEditor)
        return () => window.removeEventListener('showLinkEditor', handleShowLinkEditor)
    }, [])

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 max-w-md">
                    <div className="text-4xl mb-4">⏰</div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">
                        {error === 'Document has expired' ? t?.error : 'Access Denied'}
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {error === 'Document has expired'
                            ? t?.tempPadExpirationBanner.replace('48 hours', '0 hours')
                            : 'This document is not available.'}
                    </p>
                    <a href="/" className="inline-block px-4 py-2 bg-black text-white rounded-md">
                        {t?.goHome || 'Go Home'}
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Expiration Banner */}
            <div className="bg-amber-50 border-b border-amber-100 py-3 px-4">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t?.tempPadExpirationBanner || 'This pad will expire in 48 hours.'}
                    </div>
                    <button
                        onClick={handleClaim}
                        disabled={claiming}
                        className="w-full sm:w-auto px-4 py-1.5 bg-amber-600 text-white rounded-md text-sm font-bold hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                        {claiming ? (t?.claimingPad || 'Saving...') : (t?.makePermanent || 'Save Permanently')}
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8">
                {editor && (
                    <>
                        <div className="mb-4">
                            <GoogleDocsToolbar editor={editor} />
                        </div>
                        <div className="prose max-w-none min-h-[500px] p-4 md:p-8 border border-gray-200 rounded-md focus-within:ring-2 focus-within:ring-black focus-within:border-black transition-all relative">
                            {mounted && <EditorContent editor={editor} />}
                            <ContextMenu editor={editor} />
                            {linkEditorPosition && (
                                <LinkEditor
                                    editor={editor}
                                    position={linkEditorPosition}
                                    onClose={() => setLinkEditorPosition(null)}
                                />
                            )}
                            {isSaving && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                                    Saving...
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
