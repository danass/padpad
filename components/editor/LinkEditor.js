'use client'

import { useState, useEffect, useRef } from 'react'
import { Link as LinkIcon, Pencil, Unlink, Youtube, ExternalLink } from 'lucide-react'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function LinkEditor({ editor, position, mode = 'link', onClose }) {
  const { t } = useLanguage()
  const [url, setUrl] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  // Determine placeholder and title based on mode
  const getPlaceholder = () => {
    switch (mode) {
      case 'video':
        return t?.enterVideoUrl || 'Enter video URL (YouTube, Vimeo, etc.)'
      case 'linkPreview':
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
        return <ExternalLink className="w-4 h-4 text-gray-500" />
      default:
        return <LinkIcon className="w-4 h-4 text-gray-500" />
    }
  }

  useEffect(() => {
    if (editor && position) {
      // For video and linkPreview modes, start with empty URL
      if (mode === 'video' || mode === 'linkPreview') {
        setUrl('')
        setIsEditing(true)
      } else {
        const attrs = editor.getAttributes('link')
        setUrl(attrs.href || '')
        setIsEditing(false)
      }
    }
  }, [editor, position, mode])

  useEffect(() => {
    if (inputRef.current && position && (isEditing || mode === 'video' || mode === 'linkPreview')) {
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
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose, position])

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
      default:
        editor.chain().focus().setLink({ href: finalUrl }).run()
        break
    }

    setIsEditing(false)
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
