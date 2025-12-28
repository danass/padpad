'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import CharacterCount from '@tiptap/extension-character-count'
import Dropcursor from '@tiptap/extension-dropcursor'
import Focus from '@tiptap/extension-focus'
import Gapcursor from '@tiptap/extension-gapcursor'
import Typography from '@tiptap/extension-typography'
import FileHandler from '@tiptap/extension-file-handler'
import FontFamily from '@tiptap/extension-font-family'
import InvisibleCharacters from '@tiptap/extension-invisible-characters'
import ListKeymap from '@tiptap/extension-list-keymap'
import UniqueID from '@tiptap/extension-unique-id'
import Emoji from '@tiptap/extension-emoji'
import { Youtube } from '@/lib/editor/youtube-extension'
import { LinkPreview } from '@/lib/editor/link-preview-extension'
import { ChatConversation } from '@/lib/editor/chat-extension'
import { Video } from '@/lib/editor/video-extension'
import { Audio } from '@/lib/editor/audio-extension'
import { TaskList, TaskItem } from '@/lib/editor/task-list-extension'
// Collaboration requires Y.js and WebSocket provider - commented out for now
// import Collaboration from '@tiptap/extension-collaboration'
// import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
// import * as Y from 'yjs'
import { ResizableImage } from '@/lib/editor/resizable-image-extension'
import { Drawing } from '@/lib/editor/drawing-extension'
import {
  DraggableParagraph,
  DraggableHeading,
  DraggableBulletList,
  DraggableOrderedList,
  DraggableBlockquote,
  DraggableCodeBlock,
} from '@/lib/editor/draggable-nodes'
import { Details, DetailsSummary, DetailsContent } from '@/lib/editor/details-extension'
import { FontSize } from '@/lib/editor/font-size-extension'
import { LineHeight } from '@/lib/editor/line-height-extension'
import GoogleDocsToolbar from '@/components/editor/GoogleDocsToolbar'
import ContextMenu from '@/components/editor/ContextMenu'
import HistoryPanel from '@/components/editor/HistoryPanel'
import LinkEditor from '@/components/editor/LinkEditor'
import IpfsBrowser from '@/components/ipfs/IpfsBrowser'
import BubbleToolbar from '@/components/editor/BubbleToolbar'
import FloatingToolbar from '@/components/editor/FloatingToolbar'
import { useEditorStore } from '@/store/editorStore'
import { useToast } from '@/components/ui/toast'
import { replayHistory } from '@/lib/editor/history-replay'
import { calculateDiff } from '@/lib/editor/prosemirror-diff'

export default function DocumentPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [showIpfsBrowser, setShowIpfsBrowser] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [isFullWidth, setIsFullWidth] = useState(false)
  const [autoPublicDate, setAutoPublicDate] = useState(null)
  const [birthDate, setBirthDate] = useState(null)
  const [showAutoPublicModal, setShowAutoPublicModal] = useState(false)
  const [linkEditorPosition, setLinkEditorPosition] = useState(null)
  const [linkEditorMode, setLinkEditorMode] = useState(null) // 'link', 'video', or 'linkPreview'
  const [isOwner, setIsOwner] = useState(true) // Default to true, will be set from API
  const [isFeatured, setIsFeatured] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCurator, setIsCurator] = useState(false)
  const [keywords, setKeywords] = useState([]) // Document keywords
  const [keywordInput, setKeywordInput] = useState('') // Input for adding keywords
  const [mounted, setMounted] = useState(false)
  const [showKeywordsDropdown, setShowKeywordsDropdown] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const keywordsDropdownRef = useRef(null)
  const [hasChanges, setHasChanges] = useState(false) // Track if there are unsaved changes for UI
  const autosaveTimeoutRef = useRef(null)
  const snapshotIntervalRef = useRef(null)
  const lastSnapshotContentRef = useRef(null)
  const lastSavedContentRef = useRef(null) // Track last saved content to prevent duplicate saves
  const pendingContentRef = useRef(null) // Store content to load when editor is ready
  const isDocumentDeletedRef = useRef(false) // Track if document was deleted
  const isLoadedRef = useRef(false) // Track if initial document content is loaded
  const hasChangesRef = useRef(false) // Track if there are unsaved changes for snapshot
  const { showToast } = useToast()

  const {
    currentDocument,
    setCurrentDocument,
    setCurrentContent,
    markSaved,
    currentVersion
  } = useEditorStore()

  // Debounced autosave - increased debounce time and prevent multiple saves
  const handleAutosave = useCallback(async (content) => {
    if (!documentId || loading || !isLoadedRef.current || isDocumentDeletedRef.current || (!isOwner && !isAdmin)) return

    // Check if content actually changed
    const contentStr = JSON.stringify(content)
    if (lastSavedContentRef.current === contentStr) {
      return // No changes, skip save
    }

    // Clear existing timeout
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current)
    }

    // Set new timeout - increased to 2 seconds to batch changes
    autosaveTimeoutRef.current = setTimeout(async () => {
      // If already saving, reschedule this check
      if (saving) {
        handleAutosave(content)
        return
      }

      // Double check content hasn't changed during timeout
      const currentState = useEditorStore.getState()
      const currentContentStr = JSON.stringify(currentState.currentContent)
      if (lastSavedContentRef.current === currentContentStr) {
        return // Content was already saved
      }

      setSaving(true)
      try {
        // Calculate diff (simplified - in production, use proper ProseMirror steps)
        const diff = calculateDiff(null, content)

        // Get current version
        const version = useEditorStore.getState().currentVersion

        // Send event
        const eventResponse = await fetch(`/api/documents/${documentId}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: diff.type || 'meta',
            payload: diff.payload || { content },
            version
          })
        })

        if (!eventResponse.ok) {
          // If 404 or 401, user doesn't have access or document was deleted
          if (eventResponse.status === 404 || eventResponse.status === 401) {
            // Mark as deleted to prevent further autosave attempts
            isDocumentDeletedRef.current = true
            // Clear any pending autosaves
            if (autosaveTimeoutRef.current) {
              clearTimeout(autosaveTimeoutRef.current)
              autosaveTimeoutRef.current = null
            }
            // Close tab and redirect
            window.dispatchEvent(new CustomEvent('documentDeleted', {
              detail: { documentId }
            }))
            router.push('/drive')
            return
          }
          // For other errors, don't throw - just log and continue
          console.error('Failed to save event:', eventResponse.status, eventResponse.statusText)
          setSaving(false)
          return
        }

        // Mark as saved and update last saved content
        lastSavedContentRef.current = currentContentStr
        // Content is saved in an event, no need for immediate snapshot anymore
        // This was redundant and causing DB bloat. Snapshots occur every 10 mins.
        markSaved()
        hasChangesRef.current = true
      } catch (err) {
        console.error('Autosave error:', err)
        setError(err.message)
        showToast('Failed to save: ' + err.message, 'error')
      } finally {
        setSaving(false)
      }
    }, 800) // Reduced from 2s to 800ms for better responsiveness
  }, [documentId, loading, saving, markSaved, showToast, router, isOwner])

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: 'end',
    extensions: [
      StarterKit.configure({
        paragraph: false, // We use DraggableParagraph instead
        heading: false, // We use DraggableHeading instead
        bulletList: false, // We use DraggableBulletList instead
        orderedList: false, // We use DraggableOrderedList instead
        blockquote: false, // We use DraggableBlockquote instead
        codeBlock: false,
        taskList: false, // We configure it separately with TaskList extension
        dropcursor: false, // We configure it separately
        gapcursor: false, // We configure it separately
      }),
      DraggableParagraph,
      DraggableHeading,
      DraggableBulletList,
      DraggableOrderedList,
      DraggableBlockquote,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'Title'
          }
          return 'Tell your story...'
        },
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-cyan-600 underline cursor-pointer',
        },
      }),
      Underline,
      Subscript,
      Superscript,
      DraggableCodeBlock.configure({
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
        types: ['heading', 'paragraph', 'linkPreview'],
      }),
      CharacterCount,
      Dropcursor.configure({
        color: '#3b82f6',
        width: 2,
      }),
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      Gapcursor,
      Typography,
      FileHandler.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        onDrop: (currentEditor, files, pos) => {
          files.forEach(file => {
            const fileReader = new FileReader()
            fileReader.readAsDataURL(file)
            fileReader.onload = () => {
              currentEditor.chain().insertContentAt(pos, {
                type: 'image',
                attrs: { src: fileReader.result, alt: file.name },
              }).focus().run()
            }
          })
        },
        onPaste: (currentEditor, files, htmlContent) => {
          files.forEach(file => {
            if (file.type.startsWith('image/')) {
              const fileReader = new FileReader()
              fileReader.readAsDataURL(file)
              fileReader.onload = () => {
                currentEditor.chain().insertContent({
                  type: 'image',
                  attrs: { src: fileReader.result, alt: file.name },
                }).focus().run()
              }
            }
          })
        },
      }),
      FontFamily,
      FontSize,
      LineHeight,
      // InvisibleCharacters, // Disabled - user doesn't want invisible characters
      ListKeymap,
      UniqueID.configure({
        attributeName: 'id',
        types: ['heading', 'paragraph'],
      }),
      Details,
      DetailsSummary,
      DetailsContent,
      Emoji.configure({
        enableEmoticons: true,
        suggestion: {
          char: ':',
          allowSpaces: false,
          allowedPrefixes: [' '],
          startOfLine: false,
        },
      }),
      Youtube.configure({
        width: 640,
        height: 480,
        controls: true,
        nocookie: false,
      }),
      TaskList,
      TaskItem,
      Drawing,
      LinkPreview,
      ChatConversation,
      Video,
      Audio,
    ],
    content: null,
    editable: true,
    editorProps: {
      handleClick: (view, pos, event) => {
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
              const editorContainer = editor.view.dom.closest('.prose') || editor.view.dom.parentElement
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
      },
    },
    onUpdate: ({ editor }) => {
      // Content changes are handled in a separate useEffect
    },
  })

  // Handle updates in a separate effect to ensure handleAutosave is fresh
  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      const content = editor.getJSON()
      // Use queueMicrotask to avoid flushSync error during render
      queueMicrotask(() => {
        setCurrentContent(content)
        handleAutosave(content)
      })
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, handleAutosave, setCurrentContent])

  // Set mounted state to prevent flushSync errors during hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close keywords dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (keywordsDropdownRef.current && !keywordsDropdownRef.current.contains(event.target)) {
        setShowKeywordsDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Listen for showLinkEditor event from toolbar
  useEffect(() => {
    const handleShowLinkEditor = (e) => {
      setLinkEditorPosition(e.detail.position)
      setLinkEditorMode(e.detail.mode || 'link')
    }

    window.addEventListener('showLinkEditor', handleShowLinkEditor)
    return () => {
      window.removeEventListener('showLinkEditor', handleShowLinkEditor)
    }
  }, [])

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

    // Use capture phase to intercept before TipTap's default handler
    document.addEventListener('paste', handlePaste, true)

    return () => {
      document.removeEventListener('paste', handlePaste, true)
    }
  }, [editor])

  // Detect slash commands - improved detection


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (editor) {
          const content = editor.getJSON()
          handleAutosave(content)
        }
      }

      // Cmd/Ctrl + K to insert link
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (editor) {
          const { selection } = editor.state
          // Check if there's a selection
          if (!selection.empty) {
            // Get position for link editor
            const view = editor.view
            const coords = view.coordsAtPos(selection.from)
            const editorContainer = view.dom.closest('.prose') || view.dom.parentElement
            const containerRect = editorContainer?.getBoundingClientRect()
            if (containerRect) {
              setLinkEditorPosition({
                top: coords.bottom - containerRect.top + 8,
                left: coords.left - containerRect.left,
              })
            } else {
              setLinkEditorPosition({
                top: coords.bottom + 8,
                left: coords.left,
              })
            }
          } else {
            // No selection - prompt for URL directly
            const url = window.prompt('Link URL:')
            if (url) {
              let formattedUrl = url.trim()
              if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
                formattedUrl = `https://${formattedUrl}`
              }
              editor.chain().focus().setLink({ href: formattedUrl }).run()
            }
          }
        }
      }

      // Cmd/Ctrl + E to export
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault()
        handleExport('md')
      }

      // Cmd/Ctrl + H to open history
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault()
        setShowHistory(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editor, showHistory, handleAutosave])

  // Track if content has changed since last snapshot

  // Update hasChanges when content changes
  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      hasChangesRef.current = true
      setHasChanges(true)
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor])

  // Snapshot every minute ONLY if content has changed AND user is owner
  useEffect(() => {
    if (!documentId || !editor || !isOwner) return

    snapshotIntervalRef.current = setInterval(async () => {
      // Only create snapshot if there were actual changes
      if (!hasChangesRef.current) {
        return // No changes, skip snapshot
      }

      try {
        const currentContent = editor.getJSON()

        // Normalize JSON for comparison (same as API)
        const normalizeJSON = (obj) => {
          if (obj === null || typeof obj !== 'object') {
            return obj
          }
          if (Array.isArray(obj)) {
            return obj.map(normalizeJSON).sort((a, b) => {
              const aStr = JSON.stringify(a)
              const bStr = JSON.stringify(b)
              return aStr < bStr ? -1 : aStr > bStr ? 1 : 0
            })
          }
          const sorted = {}
          Object.keys(obj).sort().forEach(key => {
            sorted[key] = normalizeJSON(obj[key])
          })
          return sorted
        }

        const normalizedCurrent = normalizeJSON(currentContent)
        const currentContentStr = JSON.stringify(normalizedCurrent)

        // Check if content is empty before creating snapshot
        const isContentEmpty = (content) => {
          if (!content || !content.content || !Array.isArray(content.content)) {
            return true
          }
          const hasNonEmptyContent = content.content.some(node => {
            if (node.type === 'paragraph') {
              if (!node.content || node.content.length === 0) {
                return false
              }
              return node.content.some(textNode => {
                if (textNode.type === 'text' && textNode.text && textNode.text.trim().length > 0) {
                  return true
                }
                return false
              })
            }
            return true
          })
          return !hasNonEmptyContent
        }

        // Double-check content actually changed and is not empty
        if (lastSnapshotContentRef.current !== currentContentStr && !isContentEmpty(currentContent)) {
          const snapshotResponse = await fetch(`/api/documents/${documentId}/snapshot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content_json: currentContent })
          })

          if (snapshotResponse.ok) {
            const result = await snapshotResponse.json()
            // Only update if snapshot was actually created (not skipped)
            if (!result.skipped) {
              lastSnapshotContentRef.current = currentContentStr
              hasChangesRef.current = false // Reset flag after successful save
              showToast('Document saved', 'success')
            } else {
              // Snapshot was skipped because content is identical or empty
              hasChangesRef.current = false
              lastSnapshotContentRef.current = currentContentStr // Update ref even if skipped
            }
          } else if (snapshotResponse.status === 404 || snapshotResponse.status === 401) {
            // User doesn't have access - redirect to drive
            window.dispatchEvent(new CustomEvent('documentDeleted', {
              detail: { documentId }
            }))
            router.push('/drive')
            return
          }
        } else {
          hasChangesRef.current = false // Content didn't actually change or is empty
        }
      } catch (err) {
        console.error('Error creating snapshot:', err)
      }
    }, 600000) // Every 10 minutes

    return () => {
      if (snapshotIntervalRef.current) {
        clearInterval(snapshotIntervalRef.current)
      }
    }
  }, [documentId, editor, showToast, router, isOwner])

  // Manual save function
  const handleManualSave = async () => {
    if (!documentId || !editor) return

    try {
      const currentContent = editor.getJSON()
      const snapshotResponse = await fetch(`/api/documents/${documentId}/snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_json: currentContent })
      })

      if (snapshotResponse.ok) {
        const result = await snapshotResponse.json()
        if (!result.skipped) {
          // Normalize content for comparison
          const normalizeJSON = (obj) => {
            if (obj === null || typeof obj !== 'object') {
              return obj
            }
            if (Array.isArray(obj)) {
              return obj.map(normalizeJSON).sort((a, b) => {
                const aStr = JSON.stringify(a)
                const bStr = JSON.stringify(b)
                return aStr < bStr ? -1 : aStr > bStr ? 1 : 0
              })
            }
            const sorted = {}
            Object.keys(obj).sort().forEach(key => {
              sorted[key] = normalizeJSON(obj[key])
            })
            return sorted
          }
          const normalizedContent = normalizeJSON(currentContent)
          lastSnapshotContentRef.current = JSON.stringify(normalizedContent)
          lastSavedContentRef.current = JSON.stringify(currentContent)
          hasChangesRef.current = false
          setHasChanges(false)
          markSaved()
          showToast('Document saved', 'success')
        } else {
          showToast('No changes to save', 'info')
        }
      } else {
        throw new Error('Failed to save')
      }
    } catch (err) {
      // Don't show error if document was deleted
      if (isDocumentDeletedRef.current) {
        return
      }
      console.error('Error saving document:', err)
      showToast('Failed to save: ' + err.message, 'error')
    }
  }

  // Load document
  useEffect(() => {
    async function loadDocument() {
      if (!documentId) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/documents/${documentId}`)
        if (!response.ok) {
          // If 404 or 401, user doesn't have access - redirect to drive
          if (response.status === 404 || response.status === 401) {
            // Close tab and redirect
            window.dispatchEvent(new CustomEvent('documentDeleted', {
              detail: { documentId }
            }))
            router.push('/drive')
            setLoading(false)
            return
          }
          throw new Error('Failed to load document')
        }

        const data = await response.json()
        const { document, snapshot, events, isOwner: ownerFlag, isAdmin: adminFlag, isCurator: curatorFlag } = data

        setCurrentDocument(document)
        setTitle(document.title)
        setIsPublic(document.is_public || false)
        setIsFullWidth(document.is_full_width || false)
        setIsOwner(ownerFlag !== false) // Default to true if not specified
        setIsFeatured(document.is_featured || false)
        setIsAdmin(adminFlag || false)
        setIsCurator(curatorFlag || adminFlag || false)
        setKeywords(document.keywords || [])

        // Reconstruct content using replayHistory
        let content = replayHistory(snapshot, events)

        // Helper to check if content is essentially empty
        const isEssentiallyEmpty = (c) => {
          if (!c || c.type !== 'doc' || !c.content || c.content.length === 0) return true
          if (c.content.length > 1) return false
          const firstNode = c.content[0]
          if (firstNode.type === 'paragraph' || firstNode.type === 'heading') {
            return !firstNode.content || firstNode.content.length === 0
          }
          return false
        }

        // If content is empty, try to get latest snapshot with actual content
        if (isEssentiallyEmpty(content)) {
          // Try to fetch all snapshots and find one with content
          try {
            const snapshotResponse = await fetch(`/api/documents/${documentId}/history`)
            if (snapshotResponse.ok) {
              const historyData = await snapshotResponse.json()
              const snapshots = historyData.snapshots || []

              // Try to find a snapshot with actual content (not just empty paragraph)
              for (const snap of snapshots) {
                if (snap.content_json) {
                  let snapContent = snap.content_json
                  if (typeof snapContent === 'string') {
                    try {
                      snapContent = JSON.parse(snapContent)
                    } catch (e) {
                      console.error('Error parsing snapshot:', e)
                      continue
                    }
                  }

                  // Check if this snapshot has real content (not just empty paragraph)
                  if (snapContent && snapContent.type === 'doc' &&
                    snapContent.content && Array.isArray(snapContent.content)) {
                    // Check if content has actual text or nodes with content
                    const hasRealContent = snapContent.content.some(node => {
                      // Check if node has text content
                      if (node.type === 'paragraph' || node.type === 'heading') {
                        // A paragraph with 0 sub-nodes is "empty"
                        if (!node.content || node.content.length === 0) return false

                        return node.content.some(child =>
                          (child.type === 'text' && child.text && child.text.trim().length > 0) ||
                          (child.type !== 'text') // images, etc are real content
                        )
                      }
                      // Non-paragraph nodes are considered content
                      return true
                    })

                    if (hasRealContent) {
                      content = snapContent
                      break
                    }
                  }
                }
              }

              // If still no content, use the most recent snapshot anyway
              if ((!content || content.type !== 'doc' || !content.content || content.content.length === 0) &&
                snapshots.length > 0) {
                const latestSnapshot = snapshots[0]
                if (latestSnapshot.content_json) {
                  let latestContent = latestSnapshot.content_json
                  if (typeof latestContent === 'string') {
                    try {
                      latestContent = JSON.parse(latestContent)
                    } catch (e) {
                      console.error('Error parsing latest snapshot:', e)
                    }
                  }
                  if (latestContent && latestContent.type === 'doc') {
                    content = latestContent
                  }
                }
              }
            }
          } catch (err) {
            console.error('Error fetching history for fallback:', err)
          }
        }

        // Ensure content is valid
        if (!content || typeof content !== 'object') {
          content = { type: 'doc', content: [] }
        }

        // Ensure it has the correct structure
        if (!content.type || !content.content || !Array.isArray(content.content)) {
          content = {
            type: 'doc',
            content: Array.isArray(content) ? content : (content.content || [])
          }
        }

        // Always store content to load when editor is ready
        pendingContentRef.current = content
        setPendingContentReady(true) // Trigger useEffect

        // Normalize JSON for comparison
        const normalizeJSON = (obj) => {
          if (obj === null || typeof obj !== 'object') {
            return obj
          }
          if (Array.isArray(obj)) {
            return obj.map(normalizeJSON).sort((a, b) => {
              const aStr = JSON.stringify(a)
              const bStr = JSON.stringify(b)
              return aStr < bStr ? -1 : aStr > bStr ? 1 : 0
            })
          }
          const sorted = {}
          Object.keys(obj).sort().forEach(key => {
            sorted[key] = normalizeJSON(obj[key])
          })
          return sorted
        }

        // Initialize lastSnapshotContentRef with normalized content
        const normalizedContent = normalizeJSON(content)
        lastSnapshotContentRef.current = JSON.stringify(normalizedContent)

        // Try to set content immediately if editor is ready (same as handleRestore)
        if (editor && content && editor.state && editor.state.doc) {
          try {
            const currentEditorContent = editor.getJSON()
            const normalizedCurrent = normalizeJSON(currentEditorContent)
            const currentEditorContentStr = JSON.stringify(normalizedCurrent)
            const contentStr = JSON.stringify(normalizedContent)

            // Only set if editor is empty or content is different
            const isEmpty = !currentEditorContent ||
              (currentEditorContent.type === 'doc' &&
                (!currentEditorContent.content || currentEditorContent.content.length === 0))
            const isDifferent = currentEditorContentStr !== contentStr

            if (isEmpty || isDifferent) {
              // Use same method as handleRestore
              // Wrap in queueMicrotask to avoid flushSync error
              queueMicrotask(() => {
                requestAnimationFrame(() => {
                  editor.commands.setContent(content)
                  setCurrentContent(content)
                  lastSnapshotContentRef.current = contentStr
                  isLoadedRef.current = true // Mark as loaded once initial content is set
                })
              })
              pendingContentRef.current = null // Clear pending content
              setPendingContentReady(false)
            } else {
              pendingContentRef.current = null
              setPendingContentReady(false)
              isLoadedRef.current = true // Still mark as loaded even if no change needed
            }
          } catch (error) {
            console.error('Error setting editor content:', error)
            // Content will be loaded by the useEffect retry logic
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('Error loading document:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    loadDocument()
  }, [documentId, router])

  // Listen for document deletion to stop autosave
  useEffect(() => {
    const handleDocumentDeleted = (event) => {
      const { documentId: deletedId } = event.detail
      if (deletedId === documentId) {
        // Mark as deleted to prevent further autosave attempts
        isDocumentDeletedRef.current = true
        // Clear any pending autosaves
        if (autosaveTimeoutRef.current) {
          clearTimeout(autosaveTimeoutRef.current)
          autosaveTimeoutRef.current = null
        }
        // Clear snapshot interval
        if (snapshotIntervalRef.current) {
          clearInterval(snapshotIntervalRef.current)
          snapshotIntervalRef.current = null
        }
      }
    }

    window.addEventListener('documentDeleted', handleDocumentDeleted)
    return () => {
      window.removeEventListener('documentDeleted', handleDocumentDeleted)
    }
  }, [documentId])

  // Reset deleted flag when documentId changes
  useEffect(() => {
    isDocumentDeletedRef.current = false
  }, [documentId])

  // State to trigger useEffect when pendingContentRef changes
  const [pendingContentReady, setPendingContentReady] = useState(false)

  // Load pending content when editor becomes ready AND content is available
  useEffect(() => {
    if (!editor || !pendingContentRef.current) {
      return
    }

    // Use the same approach as handleRestore - direct setContent call
    const trySetContent = (attempt = 0) => {
      if (attempt > 20) {
        console.error('Failed to set editor content after multiple attempts', {
          pendingContent: pendingContentRef.current,
          editorState: editor.state ? 'exists' : 'missing',
          editorDoc: editor.state?.doc ? 'exists' : 'missing'
        })
        pendingContentRef.current = null
        return
      }

      try {
        const content = pendingContentRef.current
        if (!content) {
          return
        }

        // Check if editor has a valid state (same check as handleRestore)
        if (editor.state && editor.state.doc) {
          // Normalize JSON for comparison
          const normalizeJSON = (obj) => {
            if (obj === null || typeof obj !== 'object') {
              return obj
            }
            if (Array.isArray(obj)) {
              return obj.map(normalizeJSON).sort((a, b) => {
                const aStr = JSON.stringify(a)
                const bStr = JSON.stringify(b)
                return aStr < bStr ? -1 : aStr > bStr ? 1 : 0
              })
            }
            const sorted = {}
            Object.keys(obj).sort().forEach(key => {
              sorted[key] = normalizeJSON(obj[key])
            })
            return sorted
          }

          const normalizedContent = normalizeJSON(content)
          const contentStr = JSON.stringify(normalizedContent)
          const currentEditorContent = editor.getJSON()
          const normalizedCurrent = normalizeJSON(currentEditorContent)
          const currentEditorContentStr = JSON.stringify(normalizedCurrent)

          // Only set if different
          if (contentStr !== currentEditorContentStr) {
            // Use the exact same method as handleRestore
            // Wrap in queueMicrotask to avoid flushSync error
            queueMicrotask(() => {
              requestAnimationFrame(() => {
                editor.commands.setContent(content)
                setCurrentContent(content)
                lastSnapshotContentRef.current = contentStr
                isLoadedRef.current = true // Mark as loaded once initial content is set
              })
            })

            pendingContentRef.current = null
            setPendingContentReady(false)
          } else {
            pendingContentRef.current = null
            setPendingContentReady(false)
            isLoadedRef.current = true // Still mark as loaded
          }
        } else {
          // Retry after delay
          setTimeout(() => trySetContent(attempt + 1), 100 * (attempt + 1))
        }
      } catch (error) {
        console.error(`Error setting pending editor content (attempt ${attempt}):`, error)
        if (attempt < 20) {
          setTimeout(() => trySetContent(attempt + 1), 100 * (attempt + 1))
        } else {
          pendingContentRef.current = null
          setPendingContentReady(false)
        }
      }
    }

    // Start trying immediately, then retry if needed
    trySetContent(0)

    // Also set up an interval to check periodically (in case editor becomes ready later)
    const intervalId = setInterval(() => {
      if (editor && pendingContentRef.current && editor.state && editor.state.doc) {
        trySetContent(0)
        clearInterval(intervalId)
      }
    }, 200)

    return () => {
      clearInterval(intervalId)
    }
  }, [editor, pendingContentReady])

  // Save title
  const handleTitleSave = async () => {
    if (!documentId) return

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })

      if (!response.ok) {
        throw new Error('Failed to update title')
      }

      // Dispatch event to update tabs
      window.dispatchEvent(new CustomEvent('documentTitleUpdated', {
        detail: { documentId, title }
      }))

      showToast('Title updated', 'success')
    } catch (err) {
      console.error('Error updating title:', err)
      setError(err.message)
      showToast('Failed to update title', 'error')
    }
  }

  // Export document
  const handleExport = async (format) => {
    if (!documentId) return

    const url = `/api/documents/${documentId}/export?format=${format}`
    window.open(url, '_blank')
  }

  // Delete document - shows confirmation modal first
  const handleDelete = () => {
    if (!documentId) return
    setShowDeleteModal(true)
  }

  // Actual delete after confirmation
  const confirmDelete = async () => {
    setShowDeleteModal(false)
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Dispatch event to close tab
        window.dispatchEvent(new CustomEvent('documentDeleted', {
          detail: { documentId }
        }))
        showToast('Document deleted', 'success')
        // Redirect to drive
        router.push('/drive')
      } else {
        const data = await response.json()
        showToast(data.error || 'Failed to delete document', 'error')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      showToast('Failed to delete document', 'error')
    }
  }

  // Restore from history
  const handleRestore = (content) => {
    if (editor && content) {
      try {
        // Ensure content is parsed if it's a string
        let parsedContent = content
        if (typeof content === 'string') {
          try {
            parsedContent = JSON.parse(content)
          } catch (e) {
            console.error('Error parsing content:', e)
            showToast('Failed to restore: invalid content format', 'error')
            return
          }
        }

        // Validate content structure
        if (!parsedContent || typeof parsedContent !== 'object') {
          console.error('Invalid content structure:', parsedContent)
          showToast('Failed to restore: invalid content', 'error')
          return
        }

        // Ensure it has the correct structure
        if (!parsedContent.type && !parsedContent.content) {
          // Wrap in doc if needed
          parsedContent = {
            type: 'doc',
            content: Array.isArray(parsedContent) ? parsedContent : [parsedContent]
          }
        }

        // Use queueMicrotask to avoid flushSync error
        queueMicrotask(() => {
          requestAnimationFrame(() => {
            editor.commands.setContent(parsedContent)
            showToast('Document restored', 'success')
          })
        })
        // Don't close the history panel after restore - let user close it manually
        // setShowHistory(false)
      } catch (error) {
        console.error('Error restoring content:', error)
        showToast('Failed to restore: ' + error.message, 'error')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={() => router.push('/drive')}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm font-medium transition-colors"
          >
            Go to Drive
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 sm:py-8">
        {/* Header with title and action buttons */}
        <div className="mb-4 relative z-[60]">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            {/* Title */}
            <div className="flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                className="text-2xl sm:text-4xl font-bold bg-transparent border-none outline-none focus:ring-0 px-0 py-2 text-gray-900 placeholder-gray-400 w-full"
                placeholder="Untitled"
              />
            </div>

            {/* Action buttons - right side */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Back to Drive */}
                <button
                  onClick={() => router.push('/drive')}
                  className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-700 transition-colors"
                  title="Back to Drive"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>

                {/* Admin mode: Manual save button */}
                {!isOwner && (
                  <button
                    onClick={handleManualSave}
                    className="px-3 py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 text-xs font-medium transition-colors flex items-center gap-1.5"
                    title="Save (Admin mode - auto-save disabled)"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save
                  </button>
                )}

                {/* Preview public */}
                {isPublic && (
                  <button
                    onClick={() => window.open(`/public/doc/${documentId}`, '_blank')}
                    className="p-1.5 bg-purple-100 text-purple-700 border border-purple-200 rounded-md hover:bg-purple-200 transition-colors"
                    title="Preview public page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                )}

                {/* History */}
                <button
                  onClick={() => setShowHistory(true)}
                  className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-700 transition-colors"
                  title="History"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                {/* Copy URL - only show if public */}
                {isPublic && (
                  <button
                    onClick={async () => {
                      const publicUrl = `${window.location.origin}/public/doc/${documentId}`
                      try {
                        await navigator.clipboard.writeText(publicUrl)
                        showToast('URL copied', 'success')
                      } catch (err) {
                        const textArea = document.createElement('textarea')
                        textArea.value = publicUrl
                        textArea.style.position = 'fixed'
                        textArea.style.opacity = '0'
                        document.body?.appendChild(textArea)
                        textArea.select()
                        document.execCommand('copy')
                        textArea.remove()
                        showToast('URL copied', 'success')
                      }
                    }}
                    className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-700 transition-colors"
                    title="Copy public URL"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                )}

                {/* Public/Private toggle - Black when private to encourage publishing */}
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/documents/${documentId}/public`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ is_public: !isPublic })
                      })
                      if (response.ok) {
                        setIsPublic(!isPublic)
                        showToast(isPublic ? 'Now private' : 'Now public', 'success')
                      }
                    } catch (err) {
                      showToast('Failed to update', 'error')
                    }
                  }}
                  className={`p-1.5 rounded-md transition-colors ${isPublic
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  title={isPublic ? 'Public - Click to make private' : 'Click to publish'}
                >
                  {isPublic ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  )}
                </button>

                {/* Full-width mode toggle - only show if public */}
                {isPublic && (
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/documents/${documentId}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ is_full_width: !isFullWidth })
                        })
                        if (response.ok) {
                          setIsFullWidth(!isFullWidth)
                          showToast(isFullWidth ? 'Normal width' : 'Full width', 'success')
                        }
                      } catch (err) {
                        showToast('Failed to update', 'error')
                      }
                    }}
                    className={`p-1.5 border rounded-md transition-colors ${isFullWidth
                      ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    title={isFullWidth ? 'Full width - Click for normal' : 'Normal width - Click for full width'}
                  >
                    {isFullWidth ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                      </svg>
                    )}
                  </button>
                )}

                {/* Keywords - For owners and curators */}
                {(isOwner || isCurator) && (
                  <div className="relative" ref={keywordsDropdownRef}>
                    <button
                      onClick={() => setShowKeywordsDropdown(!showKeywordsDropdown)}
                      className={`p-1.5 border rounded-md transition-colors ${keywords.length > 0
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      title={keywords.length > 0 ? `Keywords: ${keywords.join(', ')}` : 'Add keywords'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </button>
                    {showKeywordsDropdown && (
                      <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-3" style={{ zIndex: 10001 }}>
                        <p className="text-xs text-gray-500 mb-2 font-medium">Keywords</p>
                        <div className="flex gap-1 mb-3">
                          <input
                            type="text"
                            value={keywordInput}
                            autoFocus
                            onChange={(e) => setKeywordInput(e.target.value.toLowerCase())}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                e.stopPropagation()
                                const newKeyword = keywordInput.trim()
                                if (newKeyword && !keywords.includes(newKeyword)) {
                                  const newKeywords = [...keywords, newKeyword]
                                  fetch(`/api/documents/${documentId}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ keywords: newKeywords })
                                  }).then(response => {
                                    if (response.ok) {
                                      setKeywords(newKeywords)
                                      setKeywordInput('')
                                      showToast('Keyword added', 'success')
                                    }
                                  }).catch(() => {
                                    showToast('Failed to add keyword', 'error')
                                  })
                                } else if (newKeyword) {
                                  setKeywordInput('')
                                }
                              }
                            }}
                            placeholder="Add keyword (Enter)..."
                            className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                          />
                        </div>
                        {keywords.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {keywords.map((keyword) => (
                              <span
                                key={keyword}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100"
                              >
                                {keyword}
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    const newKeywords = keywords.filter(k => k !== keyword)
                                    try {
                                      const response = await fetch(`/api/documents/${documentId}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ keywords: newKeywords })
                                      })
                                      if (response.ok) {
                                        setKeywords(newKeywords)
                                        showToast('Keyword removed', 'success')
                                      }
                                    } catch (err) {
                                      showToast('Failed to remove keyword', 'error')
                                    }
                                  }}
                                  className="text-indigo-400 hover:text-indigo-600 transition-colors"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic py-1">No keywords yet</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Export */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowExportMenu(!showExportMenu)
                    }}
                    className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-700 transition-colors"
                    title="Export"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  {showExportMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-[500]"
                        onClick={() => setShowExportMenu(false)}
                      />
                      <div className="fixed mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-[501]" style={{ top: '120px', right: '24px' }}>
                        <button
                          onClick={() => { handleExport('md'); setShowExportMenu(false) }}
                          className="block w-full text-left px-3 py-1.5 hover:bg-gray-50 rounded-t-md text-sm"
                        >
                          Markdown
                        </button>
                        <button
                          onClick={() => { handleExport('txt'); setShowExportMenu(false) }}
                          className="block w-full text-left px-3 py-1.5 hover:bg-gray-50 text-sm"
                        >
                          Text
                        </button>
                        <button
                          onClick={() => { handleExport('html'); setShowExportMenu(false) }}
                          className="block w-full text-left px-3 py-1.5 hover:bg-gray-50 text-sm"
                        >
                          HTML
                        </button>
                        <button
                          onClick={() => { handleExport('json'); setShowExportMenu(false) }}
                          className="block w-full text-left px-3 py-1.5 hover:bg-gray-50 rounded-b-md text-sm"
                        >
                          JSON
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Feature toggle - Admin and Curators only */}
                {(isAdmin || isCurator) && (
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/documents/${documentId}/featured`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ featured: !isFeatured })
                        })
                        if (response.ok) {
                          setIsFeatured(!isFeatured)
                          showToast(!isFeatured ? 'Document featured!' : 'Document unfeatured', 'success')
                        }
                      } catch (error) {
                        showToast('Failed to update featured status', 'error')
                      }
                    }}
                    className={`p-1.5 border rounded-md transition-colors ${isFeatured
                      ? 'border-yellow-400 bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    title={isFeatured ? 'Unfeature' : 'Feature on homepage'}
                  >
                    <svg className="w-4 h-4" fill={isFeatured ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                )}

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDelete()
                  }}
                  className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Save status and character count */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                {saving && <span className="text-gray-600">Saving...</span>}
                {!saving && useEditorStore.getState().hasUnsavedChanges && (
                  <span className="text-amber-600">•</span>
                )}
                {!saving && !useEditorStore.getState().hasUnsavedChanges && (
                  <span className="text-green-600">✓</span>
                )}
                {editor && (
                  <span>
                    {editor.storage.characterCount.characters()} chars
                    {editor.storage.characterCount.words() > 0 && ` • ${editor.storage.characterCount.words()} words`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Editor */}
        {editor && (
          <>
            <div className="mb-4">
              <GoogleDocsToolbar editor={editor} onOpenIpfsBrowser={() => setShowIpfsBrowser(true)} onSave={handleManualSave} saving={saving} hasChanges={hasChanges} />
            </div>
            <div
              className="prose max-w-none min-h-[500px] p-4 md:p-0 transition-all pb-24 md:pb-32 relative cursor-text"
              onClick={(e) => {
                // Only handle clicks directly on the prose container (empty space below content)
                if (e.target === e.currentTarget && editor) {
                  const { state } = editor
                  const { doc } = state
                  const lastNode = doc.lastChild

                  // If there's already an empty paragraph at the end, just focus it
                  if (lastNode?.type.name === 'paragraph' && lastNode.content.size === 0) {
                    editor.chain().focus('end').run()
                  } else {
                    // Insert a new paragraph at the END of the document (not replacing selection)
                    const endPos = doc.content.size
                    editor.chain()
                      .insertContentAt(endPos, { type: 'paragraph' })
                      .focus('end')
                      .run()
                  }
                }
              }}
            >
              {mounted && editor && (
                <>
                  <BubbleMenu
                    editor={editor}
                    tippyOptions={{ duration: 100 }}
                    shouldShow={({ state, from, to }) => {
                      // Only show if there's a text selection and no media nodes involved
                      if (from === to) return false

                      const mediaNodes = ['resizableImage', 'video', 'youtube', 'audio', 'drawing', 'linkPreview', 'image']

                      // Check if it's a node selection (clicking on a node)
                      if (state.selection.node) {
                        if (mediaNodes.includes(state.selection.node.type.name)) {
                          return false
                        }
                      }

                      // Check if the selection is inside a media node (check $from)
                      const $from = state.selection.$from
                      for (let d = $from.depth; d >= 0; d--) {
                        const node = $from.node(d)
                        if (mediaNodes.includes(node.type.name)) {
                          return false
                        }
                      }

                      // Check $to position as well
                      const $to = state.selection.$to
                      for (let d = $to.depth; d >= 0; d--) {
                        const node = $to.node(d)
                        if (mediaNodes.includes(node.type.name)) {
                          return false
                        }
                      }

                      // Check the node directly at the from position
                      const nodeAtFrom = state.doc.nodeAt(from)
                      if (nodeAtFrom && mediaNodes.includes(nodeAtFrom.type.name)) {
                        return false
                      }

                      // Check if selection contains any media nodes
                      let hasMedia = false
                      state.doc.nodesBetween(from, to, (node) => {
                        if (mediaNodes.includes(node.type.name)) {
                          hasMedia = true
                          return false
                        }
                      })

                      return !hasMedia
                    }}
                  >
                    <BubbleToolbar
                      editor={editor}
                      onOpenLinkEditor={() => {
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
                      }}
                    />
                  </BubbleMenu>

                  <FloatingMenu
                    editor={editor}
                    tippyOptions={{ duration: 100 }}
                    shouldShow={({ state }) => {
                      const { selection } = state
                      const { $from, empty } = selection
                      return empty && $from.parent.type.name === 'paragraph' && $from.parent.content.size === 0
                    }}
                  >
                    <FloatingToolbar
                      editor={editor}
                      onOpenIpfsBrowser={() => setShowIpfsBrowser(true)}
                    />
                  </FloatingMenu>

                  <EditorContent editor={editor} />
                </>
              )}
              <ContextMenu editor={editor} />
              {linkEditorPosition && (
                <LinkEditor
                  editor={editor}
                  position={linkEditorPosition}
                  mode={linkEditorMode}
                  onClose={() => {
                    setLinkEditorPosition(null)
                    setLinkEditorMode(null)
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>

      {showHistory && (
        <HistoryPanel
          documentId={documentId}
          onRestore={handleRestore}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* IPFS Browser Modal */}
      <IpfsBrowser
        isOpen={showIpfsBrowser}
        onClose={() => setShowIpfsBrowser(false)}
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

          setShowIpfsBrowser(false)
        }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[9999]"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 z-[10000] w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Document</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

