'use client'

import { useState, useEffect, useRef } from 'react'
import { Link as LinkIcon, Pencil, Unlink } from 'lucide-react'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function LinkEditor({ editor, position, onClose }) {
  const { t } = useLanguage()
  const [url, setUrl] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (editor && position) {
      const attrs = editor.getAttributes('link')
      setUrl(attrs.href || '')
      setIsEditing(false)
    }
  }, [editor, position])

  useEffect(() => {
    if (inputRef.current && position && isEditing) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [position, isEditing])

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
    if (finalUrl) {
      // Auto-add https:// if no protocol is specified
      if (!finalUrl.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//)) {
        // Check if it looks like a URL (contains a dot)
        if (finalUrl.includes('.')) {
          finalUrl = 'https://' + finalUrl
        }
      }
      editor.chain().focus().setLink({ href: finalUrl }).run()
    } else {
      editor.chain().focus().unsetLink().run()
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

  const hasExistingLink = editor.getAttributes('link')?.href

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
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

