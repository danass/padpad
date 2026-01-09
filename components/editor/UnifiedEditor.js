'use client'

import { useEffect, useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import { createEditorExtensions } from '@/lib/editor/extensions-config'
import GoogleDocsToolbar from '@/components/editor/GoogleDocsToolbar'
import ContextMenu from '@/components/editor/ContextMenu'
import BubbleToolbar from '@/components/editor/BubbleToolbar'
import FloatingToolbar from '@/components/editor/FloatingToolbar'
import LinkEditor from '@/components/editor/LinkEditor'
import IpfsBrowser from '@/components/ipfs/IpfsBrowser'
import EditorSkeleton from './EditorSkeleton'

/**
 * UnifiedEditor - A shared editor component for both home page and document page
 * 
 * @param {Object} props
 * @param {Object} props.initialContent - Initial TipTap JSON content
 * @param {boolean} props.editable - Whether the editor is editable
 * @param {Function} props.onUpdate - Called when content changes, receives editor JSON
 * @param {Function} props.onSave - Save handler for toolbar button
 * @param {boolean} props.saving - Whether save is in progress
 * @param {boolean} props.hasChanges - Whether there are unsaved changes
 * @param {Object} props.features - Feature flags
 * @param {boolean} props.features.showToolbar - Show GoogleDocsToolbar
 * @param {boolean} props.features.showBubbleMenu - Show BubbleMenu on selection
 * @param {boolean} props.features.showFloatingMenu - Show FloatingMenu on empty line
 * @param {boolean} props.features.showContextMenu - Show right-click ContextMenu
 * @param {boolean} props.features.showIpfsBrowser - Show IPFS browser option
 * @param {boolean} props.features.showSaveButton - Show manual Save button in toolbar
 * @param {string} props.placeholderText - Custom placeholder text
 * @param {string} props.placeholderTitle - Custom placeholder text for title
 * @param {string} props.className - Additional CSS classes for editor container
 * @param {Function} props.onEditorReady - Called with the editor instance when created
 */
const UnifiedEditor = forwardRef(function UnifiedEditor({
    initialContent = null,
    editable = true,
    onUpdate,
    onSave,
    saving = false,
    hasChanges = false,
    features = {},
    placeholderText = 'Tell your story...',
    placeholderTitle = 'Title',
    className = '',
    onEditorReady,
}, ref) {
    const {
        showToolbar = true,
        showBubbleMenu = false,
        showFloatingMenu = false,
        showContextMenu = false,
        showIpfsBrowser = false,
        showSaveButton = true,
        saveButtonIconOnly = false,
        onFileDrop,
        onFilePaste,
    } = features

    const [mounted, setMounted] = useState(false)

    const [linkEditorPosition, setLinkEditorPosition] = useState(null)
    const [linkEditorMode, setLinkEditorMode] = useState(null)
    const [showIpfsBrowserModal, setShowIpfsBrowserModal] = useState(false)
    const editorContainerRef = useRef(null)
    const contentSetRef = useRef(false)
    const onUpdateRef = useRef(onUpdate)

    // Update the ref whenever onUpdate changes
    useEffect(() => {
        onUpdateRef.current = onUpdate
    }, [onUpdate])

    const editor = useEditor({
        immediatelyRender: false,
        autofocus: 'end',
        extensions: createEditorExtensions({
            placeholderText,
            placeholderTitle,
            onFileDrop: features?.onFileDrop,
            onFilePaste: features?.onFilePaste,
        }),
        content: null,
        editable,
        editorProps: {
            /* handleClick: (view, pos, event) => {
                const { state } = view
                const { selection } = state
                const { $from } = selection

                // Check if clicking on a link
                const linkMark = state.schema.marks.link
                if (linkMark) {
                    const linkAttrs = linkMark.isInSet($from.marks())
                    if (linkAttrs) {
                        event.preventDefault()
                        const linkElement = event.target.closest('a')
                        if (linkElement) {
                            const rect = linkElement.getBoundingClientRect()
                            const editorContainer = view.dom.closest('.prose') || view.dom.parentElement
                            const containerRect = editorContainer?.getBoundingClientRect()
                            if (containerRect) {
                                setLinkEditorPosition({
                                    top: rect.bottom - containerRect.top + 8,
                                    left: rect.left - containerRect.left,
                                })
                            } else {
                                setLinkEditorPosition({
                                    top: rect.bottom + 8,
                                    left: rect.left,
                                })
                            }
                        }
                        return true
                    }
                }
                return false
            }, */
        },
        onUpdate: ({ editor }) => {
            const json = editor.getJSON()
            if (onUpdateRef.current) {
                onUpdateRef.current(json)
            }
        },
    })

    // Expose editor instance via ref
    useImperativeHandle(ref, () => ({
        editor,
        getContent: () => editor?.getJSON(),
        setContent: (content) => {
            if (editor && content) {
                editor.commands.setContent(content)
                contentSetRef.current = true
            }
        },
        focus: () => editor?.commands.focus(),
    }), [editor])

    // Call onEditorReady when editor is created
    useEffect(() => {
        if (editor && onEditorReady) {
            onEditorReady(editor)
        }
    }, [editor, onEditorReady])

    // Set mounted state
    useEffect(() => {
        setMounted(true)
    }, [])

    // Update placeholder when placeholderText or placeholderTitle changes
    useEffect(() => {
        if (editor && !editor.isDestroyed) {
            // Update the placeholder extension options specifically
            editor.setOptions({
                placeholder: {
                    placeholder: ({ node }) => {
                        if (node.type.name === 'heading') {
                            return placeholderTitle
                        }
                        return placeholderText
                    }
                }
            })

            // Force a view update to refresh the placeholder decorations
            // We use a small hack to trigger Prosemirror's decoration recalculation
            const { state } = editor
            const { tr } = state
            editor.view.dispatch(tr.setMeta('addToHistory', false))
        }
    }, [editor, placeholderText, placeholderTitle])

    // Set initial content when editor is ready
    useEffect(() => {
        if (editor && initialContent && !contentSetRef.current) {
            // Wait for editor to be fully ready
            queueMicrotask(() => {
                requestAnimationFrame(() => {
                    editor.commands.setContent(initialContent)
                    contentSetRef.current = true
                })
            })
        }
    }, [editor, initialContent])

    // Handle click outside link editor
    useEffect(() => {
        function handleClickOutside(event) {
            if (linkEditorPosition && !event.target.closest('.link-editor-container')) {
                setLinkEditorPosition(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [linkEditorPosition])

    // Listen for custom event to show link editor
    useEffect(() => {
        const handleShowLinkEditor = (e) => {
            const { position, mode, existingLink, existingSize } = e.detail
            // Store existingLink and existingSize in the position object
            if (position) {
                const positionWithData = { ...position }
                if (existingLink) positionWithData.existingUrl = existingLink
                if (existingSize) positionWithData.existingSize = existingSize
                setLinkEditorPosition(positionWithData)
            }
            if (mode) setLinkEditorMode(mode)
        }
        window.addEventListener('showLinkEditor', handleShowLinkEditor)
        return () => window.removeEventListener('showLinkEditor', handleShowLinkEditor)
    }, [])

    // Keyboard shortcut handler
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                if (onSave && hasChanges) {
                    onSave()
                }
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onSave, hasChanges])

    // Detect pasted URLs and create link previews
    useEffect(() => {
        if (!editor) return

        const handlePaste = (event) => {
            const clipboardData = event.clipboardData
            if (!clipboardData) return

            const text = clipboardData.getData('text/plain').trim()

            // Check if it's a standalone URL (not just contains a URL)
            const urlPattern = /^https?:\/\/\S+$/
            if (!urlPattern.test(text)) return

            // Don't create preview for YouTube URLs (already handled by Youtube extension)
            if (text.includes('youtube.com') || text.includes('youtu.be')) return

            // Prevent default paste behavior
            event.preventDefault()
            event.stopPropagation()

            // Insert link preview node
            editor.chain().focus().insertContent({
                type: 'linkPreview',
                attrs: {
                    url: text,
                    loading: true,
                },
            }).run()
        }

        editor.view.dom.addEventListener('paste', handlePaste, true)
        return () => {
            editor.view.dom.removeEventListener('paste', handlePaste, true)
        }
    }, [editor])

    // Handle clicks on links to reopen editor modal  
    useEffect(() => {
        if (!editor) return
        const handleLinkClick = (event) => {
            const link = event.target.closest('a[href]')
            if (link && editor.isEditable) {
                event.preventDefault()
                const href = link.getAttribute('href')
                const rect = link.getBoundingClientRect()
                const container = editor.view.dom.closest('.prose') || editor.view.dom.parentElement
                const containerRect = container?.getBoundingClientRect()
                if (containerRect) {
                    window.dispatchEvent(new CustomEvent('showLinkEditor', {
                        detail: {
                            position: {
                                top: rect.bottom - containerRect.top + 8,
                                left: rect.left - containerRect.left,
                            },
                            mode: 'linkPreviewCreate',
                            existingLink: href
                        }
                    }))
                }
            }
        }
        editor.view.dom.addEventListener('click', handleLinkClick)
        return () => editor.view.dom.removeEventListener('click', handleLinkClick)
    }, [editor])

    const handleOpenLinkEditor = useCallback((e) => {
        if (!editor) return
        const { view } = editor
        const { state } = view
        const { selection } = state
        const { from } = selection
        const coords = view.coordsAtPos(from)
        const container = view.dom.closest('.prose') || view.dom.parentElement
        const containerRect = container?.getBoundingClientRect()

        if (containerRect) {
            setLinkEditorPosition({
                top: coords.bottom - containerRect.top + 8,
                left: coords.left - containerRect.left,
            })
        }
    }, [editor])

    if (!mounted) {
        return <EditorSkeleton placeholderTitle={placeholderTitle} placeholderText={placeholderText} className={className} />
    }

    return (
        <div ref={editorContainerRef} className="unified-editor">
            {/* Toolbar */}
            {showToolbar && editor && (
                <div className="mb-4" >
                    <GoogleDocsToolbar
                        editor={editor}
                        onOpenIpfsBrowser={showIpfsBrowser ? () => setShowIpfsBrowserModal(true) : undefined}
                        onSave={onSave}
                        saving={saving}
                        hasChanges={hasChanges}
                        showSaveButton={showSaveButton}
                        saveButtonIconOnly={saveButtonIconOnly}
                    />
                </div>
            )}

            {/* Editor Content */}
            <div
                className={`prose max-w-none min-h-[300px] p-4 md:p-0 relative cursor-text ${className}`}
                onClick={(e) => {
                    // Focus editor when clicking on container
                    if (e.target === e.currentTarget && editor) {
                        const { state } = editor
                        const { doc } = state
                        const lastNode = doc.lastChild

                        // If there's already an empty paragraph at the end, just focus it
                        if (lastNode?.type.name === 'paragraph' && lastNode.content.size === 0) {
                            editor.chain().focus('end').run()
                        } else {
                            // Insert a new paragraph at the END of the document
                            const endPos = doc.content.size
                            editor.chain()
                                .insertContentAt(endPos, { type: 'paragraph' })
                                .focus('end')
                                .run()
                        }
                    }
                }}
            >
                <EditorContent
                    key={`${placeholderText}-${placeholderTitle}-${onFileDrop ? 'drop' : 'no-drop'}`}
                    editor={editor}
                />

                {/* Bubble Menu - Disabled for now
                {showBubbleMenu && editor && (
                    <BubbleMenu
                        editor={editor}
                        tippyOptions={{ duration: 100 }}
                        shouldShow={({ editor: bubbleEditor, state, from, to }) => {
                            // Never show on media nodes
                            if (bubbleEditor.isActive('linkPreview')) return false
                            if (bubbleEditor.isActive('resizableImage')) return false
                            if (bubbleEditor.isActive('video')) return false
                            if (bubbleEditor.isActive('youtube')) return false
                            if (bubbleEditor.isActive('drawing')) return false
                            if (bubbleEditor.isActive('audio')) return false

                            // Only show if there's a text selection
                            if (from === to) return false

                            // Check if it's a node selection
                            if (state.selection.node) return false

                            return true
                        }}
                    >
                        <BubbleToolbar
                            editor={editor}
                            onOpenLink={(mode = 'link') => {
                                const { selection } = editor.state
                                const { $from, $to } = selection
                                const coords = editor.view.coordsAtPos($from.pos)
                                const editorContainer = editorContainerRef.current
                                const containerRect = editorContainer?.getBoundingClientRect()
                                let position
                                if (containerRect) {
                                    position = {
                                        top: coords.bottom - containerRect.top + 8,
                                        left: coords.left - containerRect.left,
                                    }
                                } else {
                                    position = {
                                        top: coords.bottom + 8,
                                        left: coords.left,
                                    }
                                }
                                setLinkEditorMode(mode)
                                setLinkEditorPosition(position)
                            }}
                        />
                    </BubbleMenu>
                )}
                */}

                {/* Floating Menu - Disabled for now
                {showFloatingMenu && editor && (
                    <FloatingMenu
                        editor={editor}
                        tippyOptions={{ duration: 100, placement: 'left' }}
                        shouldShow={({ state }) => {
                            const { $from } = state.selection
                            const currentNode = $from.parent
                            if (currentNode.type.name === 'paragraph' && currentNode.content.size === 0) {
                                return true
                            }
                            return false
                        }}
                    >
                        <FloatingToolbar
                            editor={editor}
                            onOpenIpfsBrowser={showIpfsBrowser ? () => setShowIpfsBrowserModal(true) : undefined}
                            onOpenLink={(mode = 'link') => {
                                const { selection } = editor.state
                                const { $from, $to } = selection
                                const coords = editor.view.coordsAtPos($from.pos)
                                const editorContainer = editorContainerRef.current
                                const containerRect = editorContainer?.getBoundingClientRect()
                                let position
                                if (containerRect) {
                                    position = {
                                        top: coords.bottom - containerRect.top + 8,
                                        left: coords.left - containerRect.left,
                                    }
                                } else {
                                    position = {
                                        top: coords.bottom + 8,
                                        left: coords.left,
                                    }
                                }
                                setLinkEditorMode(mode)
                                setLinkEditorPosition(position)
                            }}
                        />
                    </FloatingMenu>
                )}
                */}

                {/* Context Menu - Disabled for now
                {showContextMenu && editor && (
                    <ContextMenu editor={editor} />
                )}
                */}


                {/* Link Editor */}
                {linkEditorPosition && editor && (
                    <div className="link-editor-container">
                        <LinkEditor
                            editor={editor}
                            position={linkEditorPosition}
                            mode={linkEditorMode}
                            existingUrl={linkEditorPosition?.existingUrl}
                            existingSize={linkEditorPosition?.existingSize}
                            onClose={() => {
                                setLinkEditorPosition(null)
                                setLinkEditorMode(null)
                            }}
                        />
                    </div>
                )}
            </div>

            {/* IPFS Browser Modal */}
            {showIpfsBrowser && showIpfsBrowserModal && (
                <IpfsBrowser
                    isOpen={showIpfsBrowserModal}
                    onClose={() => setShowIpfsBrowserModal(false)}
                    onSelectFile={(file) => {
                        if (!editor || !file.gatewayUrl) return

                        const ext = file.key.split('.').pop()?.toLowerCase()
                        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
                        const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv']
                        const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac']

                        if (imageExts.includes(ext)) {
                            editor.chain().focus().insertContent({
                                type: 'image',
                                attrs: { src: file.gatewayUrl, alt: file.key },
                            }).run()
                        } else if (videoExts.includes(ext)) {
                            editor.chain().focus().insertContent({
                                type: 'video',
                                attrs: { src: file.gatewayUrl, controls: true },
                            }).run()
                        } else if (audioExts.includes(ext)) {
                            editor.chain().focus().insertContent({
                                type: 'audio',
                                attrs: { src: file.gatewayUrl, controls: true },
                            }).run()
                        } else {
                            editor.chain().focus().insertContent({
                                type: 'text',
                                marks: [{ type: 'link', attrs: { href: file.gatewayUrl } }],
                                text: file.key,
                            }).run()
                        }

                        setShowIpfsBrowserModal(false)
                    }}
                />
            )}
        </div>
    )
})

export default UnifiedEditor
