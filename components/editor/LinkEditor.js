'use client'

import { useState, useEffect, useRef } from 'react'
import { Link as LinkIcon, Pencil, Unlink, Youtube, ExternalLink } from 'lucide-react'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function LinkEditor({ editor, position, mode = 'link', existingUrl, existingSize, onClose }) {
    const { t } = useLanguage()
    const [url, setUrl] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [previewType, setPreviewType] = useState('m') // 'none', 'text', 'xs', 's', 'm', 'full'
    const [useLargestImage, setUseLargestImage] = useState(true)
    const [isEditingExisting, setIsEditingExisting] = useState(false)
    const inputRef = useRef(null)
    const containerRef = useRef(null)

    // Determine placeholder and title based on mode
    const getPlaceholder = () => {
        switch (mode) {
            case 'video':
                return t?.enterVideoUrl || 'Enter video URL (YouTube, Vimeo, etc.)'
            case 'linkPreview':
            case 'linkPreviewCreate':
                return t?.enterUrlForPreview || 'Enter URL for link preview'
            default:
                return t?.enterUrl || 'Enter URL'
        }
    }

    const getTitle = () => {
        switch (mode) {
            case 'video':
                return t?.addVideo || 'Add Video'
            case 'linkPreview':
            case 'linkPreviewCreate':
                return t?.addLinkPreview || 'Add Link Preview'
            default:
                return t?.addLink || 'Add Link'
        }
    }

    const getIcon = () => {
        switch (mode) {
            case 'video':
                return <Youtube className="w-4 h-4 text-gray-500" />
            case 'linkPreview':
            case 'linkPreviewCreate':
                return <ExternalLink className="w-4 h-4 text-gray-500" />
            default:
                return <LinkIcon className="w-4 h-4 text-gray-500" />
        }
    }

    useEffect(() => {
        if (editor && position) {
            // Check if we have an existing URL to edit
            if (existingUrl && mode === 'linkPreviewCreate') {
                setUrl(existingUrl)
                // Use existing size if provided, otherwise default to 'none'
                setPreviewType(existingSize || 'none')
                setIsEditingExisting(true)
                setIsEditing(true)
            } else if (mode === 'video' || mode === 'linkPreview' || mode === 'linkPreviewCreate') {
                // New link creation - start with empty URL
                setUrl('')
                setIsEditingExisting(false)
                setIsEditing(true)
            } else {
                const attrs = editor.getAttributes('link')
                setUrl(attrs.href || '')
                setIsEditing(false)
            }
        }
    }, [editor, position, mode, existingUrl, existingSize])

    useEffect(() => {
        if (inputRef.current && position && (isEditing || mode === 'video' || mode === 'linkPreview' || mode === 'linkPreviewCreate')) {
            inputRef.current.focus()
        }
    }, [position, isEditing, mode])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                onClose()
            }
        }

        if (position) {
            // Use a small delay to ensure the modal is mounted before adding the listener
            const timeoutId = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside, true)
            }, 0)
            return () => {
                clearTimeout(timeoutId)
                document.removeEventListener('mousedown', handleClickOutside, true)
            }
        }
    }, [onClose, position])

    // Listen for existing link URL when reopening on click
    useEffect(() => {
        const handleExistingLink = (e) => {
            if (e.detail?.existingLink && mode === 'linkPreviewCreate') {
                setUrl(e.detail.existingLink)
                setPreviewType('none')
                setIsEditingExisting(true)
            }
        }
        window.addEventListener('showLinkEditor', handleExistingLink)
        return () => window.removeEventListener('showLinkEditor', handleExistingLink)
    }, [mode])

    const handleSave = () => {
        let finalUrl = url.trim()
        if (!finalUrl) {
            onClose()
            return
        }

        // Auto-add https:// if no protocol is specified
        if (!finalUrl.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//)) {
            if (finalUrl.includes('.')) {
                finalUrl = 'https://' + finalUrl
            }
        }

        switch (mode) {
            case 'video':
                editor.chain().focus().setVideo({ src: finalUrl }).run()
                break
            case 'linkPreview':
                editor.chain().focus().setLinkPreview({ url: finalUrl }).run()
                break
            case 'linkPreviewCreate':
                // Check if we're editing an existing link
                if (isEditingExisting) {
                    // When changing from 'none' to preview type, we need to:
                    // 1. Select the entire link text
                    // 2. Delete it
                    // 3. Insert the new content

                    if (previewType === 'none') {
                        // Convert to regular link
                        if (existingSize) {
                            // Converting preview to link: delete preview and insert link
                            editor.chain()
                                .focus()
                                .deleteSelection()
                                .insertContent({
                                    type: 'text',
                                    text: finalUrl,
                                    marks: [{ type: 'link', attrs: { href: finalUrl } }]
                                })
                                .run()
                        } else {
                            // Just update the URL of the existing link
                            editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run()
                        }
                    } else {
                        // Change from link/preview to preview
                        if (existingSize) {
                            // Update existing preview without reloading
                            editor.commands.updateAttributes('linkPreview', {
                                url: finalUrl,
                                size: previewType
                            })
                        } else {
                            // Convert link to preview: remove link and insert preview
                            editor.chain()
                                .focus()
                                .extendMarkRange('link')
                                .deleteSelection()
                                .setLinkPreview({
                                    url: finalUrl,
                                    size: previewType,
                                    loading: true
                                })
                                .run()
                        }
                    }
                } else {
                    // Creating a new link
                    if (previewType === 'none') {
                        // Check if there's a selection
                        const { from, to } = editor.state.selection
                        if (from === to) {
                            // No selection, insert the URL as text and make it a link
                            editor.chain()
                                .focus()
                                .insertContent({
                                    type: 'text',
                                    text: finalUrl,
                                    marks: [{ type: 'link', attrs: { href: finalUrl } }]
                                })
                                .run()
                        } else {
                            // There's a selection, just apply the link
                            editor.chain().focus().setLink({ href: finalUrl }).run()
                        }
                    } else {
                        // Create a link preview with the selected size
                        editor.chain().focus().setLinkPreview({
                            url: finalUrl,
                            size: previewType,
                            loading: true
                        }).run()
                    }
                }
                break
            default:
                editor.chain().focus().setLink({ href: finalUrl }).run()
                break
        }

        setIsEditing(false)
        setIsEditingExisting(false)
        onClose()
    }

    const handleDelete = () => {
        editor.chain().focus().unsetLink().run()
        onClose()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSave()
        } else if (e.key === 'Escape') {
            e.preventDefault()
            setIsEditing(false)
            onClose()
        }
    }

    if (!position) return null

    const hasExistingLink = mode === 'link' && editor.getAttributes('link')?.href

    const handleModify = () => {
        setIsEditing(true)
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus()
                inputRef.current.select()
            }
        }, 0)
    }

    const handleBreakLink = () => {
        editor.chain().focus().unsetLink().run()
        onClose()
    }

    // For linkPreviewCreate mode with preview options
    if (mode === 'linkPreviewCreate') {
        return (
            <div
                ref={containerRef}
                className="absolute z-[10005] bg-white border border-gray-200 rounded-lg shadow-lg"
                style={{
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                    minWidth: '360px',
                }}
            >
                <div className="p-3 space-y-3">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {getTitle()}
                    </div>

                    {/* URL Input */}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="pl-3 pr-2 py-2">
                            {getIcon()}
                        </div>
                        <div className="flex-1 px-2 py-2 text-sm text-gray-900 border-l border-gray-200">
                            <input
                                ref={inputRef}
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={getPlaceholder()}
                                className="w-full bg-transparent border-none outline-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Preview Type Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600">Preview Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setPreviewType('none')}
                                className={`px-3 py-2 text-xs rounded-lg border transition-all ${previewType === 'none'
                                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                No style
                            </button>
                            <button
                                onClick={() => setPreviewType('text')}
                                className={`px-3 py-2 text-xs rounded-lg border transition-all ${previewType === 'text'
                                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                Text
                            </button>
                            <button
                                onClick={() => setPreviewType('xs')}
                                className={`px-3 py-2 text-xs rounded-lg border transition-all ${previewType === 'xs'
                                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                XS
                            </button>
                            <button
                                onClick={() => setPreviewType('s')}
                                className={`px-3 py-2 text-xs rounded-lg border transition-all ${previewType === 's'
                                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                S
                            </button>
                            <button
                                onClick={() => setPreviewType('m')}
                                className={`px-3 py-2 text-xs rounded-lg border transition-all ${previewType === 'm'
                                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                M
                            </button>
                            <button
                                onClick={() => setPreviewType('full')}
                                className={`px-3 py-2 text-xs rounded-lg border transition-all ${previewType === 'full'
                                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                FW
                            </button>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleSave}
                        className="w-full px-3 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                    >
                        {isEditingExisting ? (t?.update || 'Update') : (t?.add || 'Add')}
                    </button>
                </div>
            </div>
        )
    }

    // For video and linkPreview modes, show simple input form
    if (mode === 'video' || mode === 'linkPreview') {
        return (
            <div
                ref={containerRef}
                className="absolute z-[10005] bg-white border border-gray-200 rounded-lg shadow-lg"
                style={{
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                    minWidth: '320px',
                }}
            >
                <div className="p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        {getTitle()}
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="pl-3 pr-2 py-2">
                            {getIcon()}
                        </div>
                        <div className="flex-1 px-2 py-2 text-sm text-gray-900 border-l border-gray-200">
                            <input
                                ref={inputRef}
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={getPlaceholder()}
                                className="w-full bg-transparent border-none outline-none text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-1 pr-2 border-l border-gray-200">
                            <button
                                onClick={handleSave}
                                className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
                            >
                                {t?.add || 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className="absolute z-[10005] bg-white border border-gray-200 rounded-lg shadow-lg"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                minWidth: '320px',
            }}
        >
            {hasExistingLink ? (
                // View/Edit mode for existing link
                <div className="p-3">
                    {!isEditing ? (
                        // View mode
                        <>
                            <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="pl-3 pr-2 py-2">
                                    <LinkIcon className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="flex-1 px-2 py-2 text-sm text-gray-900 border-l border-gray-200 underline">
                                    {url || (t?.noLink || 'No link')}
                                </div>
                                <div className="flex items-center gap-1 pr-2 border-l border-gray-200">
                                    <button
                                        onClick={handleModify}
                                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                        title={t?.modify || 'Modify'}
                                    >
                                        <Pencil className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={handleBreakLink}
                                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                        title={t?.removeLink || 'Remove link'}
                                    >
                                        <Unlink className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                            {/* Convert to Preview button */}
                            <button
                                onClick={() => {
                                    // Remove the link and insert a link preview instead
                                    const linkUrl = url
                                    editor.chain().focus().unsetLink().deleteSelection().insertContent({
                                        type: 'linkPreview',
                                        attrs: {
                                            url: linkUrl,
                                            loading: true,
                                        },
                                    }).run()
                                    onClose()
                                }}
                                className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-left flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {t?.convertToPreview || 'Convert to Preview'}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                            >
                                {t?.removeLink || 'Remove link'}
                            </button>
                        </>
                    ) : (
                        // Edit mode
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="pl-3 pr-2 py-2">
                                    <LinkIcon className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="flex-1 px-2 py-2 text-sm text-gray-900 border-l border-gray-200">
                                    <input
                                        ref={inputRef}
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={t?.enterUrl || 'Enter URL'}
                                        className="w-full bg-transparent border-none outline-none text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-1 pr-2 border-l border-gray-200">
                                    <button
                                        onClick={handleSave}
                                        className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
                                    >
                                        {t?.save || 'Save'}
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                            >
                                {t?.cancel || 'Cancel'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                // Create mode for new link
                <div className="p-3">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="pl-3 pr-2 py-2">
                            <LinkIcon className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1 px-2 py-2 text-sm text-gray-900 border-l border-gray-200">
                            <input
                                ref={inputRef}
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t?.enterUrl || 'Enter URL'}
                                className="w-full bg-transparent border-none outline-none text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-1 pr-2 border-l border-gray-200">
                            <button
                                onClick={handleSave}
                                className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
                            >
                                {t?.save || 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
