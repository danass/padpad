'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
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
import DragHandle from '@tiptap/extension-drag-handle'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import CharacterCount from '@tiptap/extension-character-count'
import Dropcursor from '@tiptap/extension-dropcursor'
import Focus from '@tiptap/extension-focus'
import Gapcursor from '@tiptap/extension-gapcursor'
import Typography from '@tiptap/extension-typography'
import FileHandler from '@tiptap/extension-file-handler'
import FloatingMenuExtension from '@tiptap/extension-floating-menu'
import FontFamily from '@tiptap/extension-font-family'
import InvisibleCharacters from '@tiptap/extension-invisible-characters'
import ListKeymap from '@tiptap/extension-list-keymap'
import UniqueID from '@tiptap/extension-unique-id'
import Emoji from '@tiptap/extension-emoji'
import { Youtube } from '../../../lib/editor/youtube-extension'
import { TaskList, TaskItem } from '../../../lib/editor/task-list-extension'
// Collaboration requires Y.js and WebSocket provider - commented out for now
// import Collaboration from '@tiptap/extension-collaboration'
// import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
// import * as Y from 'yjs'
import { ResizableImage } from '../../../lib/editor/resizable-image-extension'
import {
  DraggableParagraph,
  DraggableHeading,
  DraggableBulletList,
  DraggableOrderedList,
  DraggableBlockquote,
  DraggableCodeBlock,
} from '../../../lib/editor/draggable-nodes'
import { Details, DetailsSummary, DetailsContent } from '../../../lib/editor/details-extension'
import EditorToolbar from '../../../components/editor/EditorToolbar'
import HistoryPanel from '../../../components/editor/HistoryPanel'
import SlashMenu from '../../../components/editor/SlashMenu'
import BubbleMenu from '../../../components/editor/BubbleMenu'
import FloatingMenu from '../../../components/editor/FloatingMenu'
import InsertBlockMenu from '../../../components/editor/InsertBlockMenu'
import { useEditorStore } from '../../../store/editorStore'
import { useToast } from '../../../components/ui/toast'
import { replayHistory } from '../../../lib/editor/history-replay'
import { calculateDiff } from '../../../lib/editor/prosemirror-diff'

export default function DocumentPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [slashMenuState, setSlashMenuState] = useState(null)
  const [insertBlockMenu, setInsertBlockMenu] = useState(null)
  const autosaveTimeoutRef = useRef(null)
  const snapshotIntervalRef = useRef(null)
  const lastSnapshotContentRef = useRef(null)
  const lastSavedContentRef = useRef(null) // Track last saved content to prevent duplicate saves
  const pendingContentRef = useRef(null) // Store content to load when editor is ready
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
    if (!documentId || saving) return
    
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
      // Double check content hasn't changed during timeout
      const currentContentStr = JSON.stringify(useEditorStore.getState().currentContent)
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
          // If 404 or 401, user doesn't have access - redirect to drive
          if (eventResponse.status === 404 || eventResponse.status === 401) {
            // Close tab and redirect
            window.dispatchEvent(new CustomEvent('documentDeleted', {
              detail: { documentId }
            }))
            router.push('/drive')
            return
          }
          throw new Error('Failed to save event')
        }
        
        // Mark as saved and update last saved content
        lastSavedContentRef.current = currentContentStr
        markSaved()
      } catch (err) {
        console.error('Autosave error:', err)
        setError(err.message)
        showToast('Failed to save: ' + err.message, 'error')
      } finally {
        setSaving(false)
      }
    }, 2000) // Increased from 500ms to 2 seconds
  }, [documentId, saving, markSaved, showToast, router])
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        paragraph: false, // We use DraggableParagraph instead
        heading: false, // We use DraggableHeading instead
        bulletList: false, // We use DraggableBulletList instead
        orderedList: false, // We use DraggableOrderedList instead
        blockquote: false, // We use DraggableBlockquote instead
        codeBlock: false, // We configure it separately
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
        placeholder: 'Start typing... Type / for commands',
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      DragHandle.configure({
        render: () => {
          const element = document.createElement('div')
          element.classList.add('custom-drag-handle')
          // Create 6 dots in 2 columns like Notion
          const dotsContainer = document.createElement('div')
          dotsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 3px; align-items: center; justify-content: center;'
          for (let i = 0; i < 3; i++) {
            const row = document.createElement('div')
            row.style.cssText = 'display: flex; gap: 3px;'
            for (let j = 0; j < 2; j++) {
              const dot = document.createElement('span')
              dot.textContent = '•'
              dot.style.cssText = 'font-size: 14px; color: #9ca3af; line-height: 1; transition: color 0.2s; display: block;'
              row.appendChild(dot)
            }
            dotsContainer.appendChild(row)
          }
          element.appendChild(dotsContainer)
          // Add hover effect
          element.addEventListener('mouseenter', () => {
            dotsContainer.querySelectorAll('span').forEach(dot => {
              dot.style.color = '#4b5563'
            })
          })
          element.addEventListener('mouseleave', () => {
            dotsContainer.querySelectorAll('span').forEach(dot => {
              dot.style.color = '#9ca3af'
            })
          })
          // Add active/dragging effect
          element.addEventListener('mousedown', () => {
            dotsContainer.querySelectorAll('span').forEach(dot => {
              dot.style.color = '#3b82f6'
            })
          })
          return element
        },
        computePositionConfig: {
          placement: 'left',
          strategy: 'absolute',
        },
      }),
      BubbleMenuExtension,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
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
        types: ['heading', 'paragraph'],
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
      FloatingMenuExtension.configure({
        element: null, // Will be handled by React component
      }),
      FontFamily,
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
    ],
    content: null,
    editable: true,
    onUpdate: ({ editor }) => {
      const content = editor.getJSON()
      setCurrentContent(content)
      handleAutosave(content)
    },
  })
  
  // Detect slash commands - improved detection
  useEffect(() => {
    if (!editor) return
    
    const checkForSlash = () => {
      try {
        const { $from } = editor.state.selection
        const textBefore = editor.state.doc.textBetween(
          Math.max(0, $from.pos - 200),
          $from.pos,
          '\n'
        )
        
        // Match "/" at start of line (after newline or at document start)
        const lines = textBefore.split('\n')
        const currentLine = lines[lines.length - 1] || ''
        const match = currentLine.match(/^\s*\/(\w*)$/)
        
        if (match) {
          const coords = editor.view.coordsAtPos($from.pos)
          setSlashMenuState({
            active: true,
            query: match[1] || '',
            position: {
              top: coords.top + window.scrollY,
              left: coords.left + window.scrollX,
            },
            range: {
              from: $from.pos - match[0].length,
              to: $from.pos
            }
          })
        } else {
          setSlashMenuState(null)
        }
      } catch (error) {
        // Ignore errors
        setSlashMenuState(null)
      }
    }
    
    editor.on('update', checkForSlash)
    editor.on('selectionUpdate', checkForSlash)
    
    return () => {
      editor.off('update', checkForSlash)
      editor.off('selectionUpdate', checkForSlash)
    }
  }, [editor])

  // Detect hover on drag handle to show insert block menu
  useEffect(() => {
    if (!editor) return

    let timeoutId = null

    const handleMouseMove = (e) => {
      const dragHandle = e.target.closest('.custom-drag-handle')
      if (dragHandle) {
        clearTimeout(timeoutId)
        const rect = dragHandle.getBoundingClientRect()
        setInsertBlockMenu({
          position: {
            top: rect.top + window.scrollY,
            left: rect.right + window.scrollX + 8,
          }
        })
      } else {
        // Delay hiding to allow moving to menu
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setInsertBlockMenu(null)
        }, 200)
      }
    }

    const editorElement = editor.view.dom
    editorElement.addEventListener('mousemove', handleMouseMove)

    return () => {
      clearTimeout(timeoutId)
      editorElement.removeEventListener('mousemove', handleMouseMove)
    }
  }, [editor])
  
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
      
      // Cmd/Ctrl + E to export
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault()
        handleExport('md')
      }
      
      // Cmd/Ctrl + H to toggle history
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault()
        setShowHistory(!showHistory)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editor, showHistory, handleAutosave])
  
  // Track if content has changed since last snapshot
  const hasChangesRef = useRef(false)
  
  // Update hasChanges when content changes
  useEffect(() => {
    if (!editor) return
    
    const handleUpdate = () => {
      hasChangesRef.current = true
    }
    
    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor])
  
  // Snapshot every minute ONLY if content has changed
  useEffect(() => {
    if (!documentId || !editor) return
    
    snapshotIntervalRef.current = setInterval(async () => {
      // Only create snapshot if there were actual changes
      if (!hasChangesRef.current) {
        return // No changes, skip snapshot
      }
      
      try {
        const currentContent = editor.getJSON()
        const currentContentStr = JSON.stringify(currentContent)
        
        // Double-check content actually changed
        if (lastSnapshotContentRef.current !== currentContentStr) {
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
              // Snapshot was skipped because content is identical
              hasChangesRef.current = false
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
          hasChangesRef.current = false // Content didn't actually change
        }
      } catch (err) {
        console.error('Error creating snapshot:', err)
      }
    }, 60000) // Every minute
    
    return () => {
      if (snapshotIntervalRef.current) {
        clearInterval(snapshotIntervalRef.current)
      }
    }
  }, [documentId, editor, showToast, router])
  
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
          lastSnapshotContentRef.current = JSON.stringify(currentContent)
          hasChangesRef.current = false
          showToast('Document saved', 'success')
        } else {
          showToast('No changes to save', 'info')
        }
      } else {
        throw new Error('Failed to save')
      }
    } catch (err) {
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
        const { document, snapshot, events } = data
        
        setCurrentDocument(document)
        setTitle(document.title)
        setIsPublic(document.is_public || false)
        
        // Reconstruct content using replayHistory
        let content = replayHistory(snapshot, events)
        
        // Debug logging
        console.log('Document loading:', {
          documentId,
          hasSnapshot: !!snapshot,
          snapshotId: snapshot?.id,
          snapshotHasContent: !!(snapshot?.content_json),
          snapshotContentType: typeof snapshot?.content_json,
          eventsCount: events?.length || 0,
          reconstructedContentType: content?.type,
          reconstructedContentLength: content?.content?.length || 0,
          reconstructedContentPreview: JSON.stringify(content).substring(0, 200)
        })
        
        // If content is empty, try to get latest snapshot directly
        if (!content || content.type !== 'doc' || !content.content || content.content.length === 0) {
          console.warn('Content is empty after replayHistory, trying direct snapshot fetch')
          
          // Try to fetch latest snapshot directly
          try {
            const snapshotResponse = await fetch(`/api/documents/${documentId}/history`)
            if (snapshotResponse.ok) {
              const historyData = await snapshotResponse.json()
              const snapshots = historyData.snapshots || []
              if (snapshots.length > 0) {
                // Get most recent snapshot
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
                  if (latestContent && latestContent.type === 'doc' && 
                      latestContent.content && Array.isArray(latestContent.content) && 
                      latestContent.content.length > 0) {
                    console.log('Found content in latest snapshot, using it')
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
        
        console.log('Stored content in pendingContentRef:', {
          hasContent: !!content,
          contentLength: content?.content?.length || 0,
          contentPreview: JSON.stringify(content).substring(0, 300),
          editorExists: !!editor,
          editorStateExists: !!(editor?.state),
          editorDocExists: !!(editor?.state?.doc)
        })
        
        // Try to set content immediately if editor is ready
        if (editor && content && editor.state && editor.state.doc) {
          try {
            const currentEditorContent = editor.getJSON()
            const currentEditorContentStr = JSON.stringify(currentEditorContent)
            const contentStr = JSON.stringify(content)
            
            // Only set if editor is empty or content is different
            const isEmpty = !currentEditorContent || 
                           (currentEditorContent.type === 'doc' && 
                            (!currentEditorContent.content || currentEditorContent.content.length === 0))
            const isDifferent = currentEditorContentStr !== contentStr
            
            console.log('Attempting to set content immediately:', {
              isEmpty,
              isDifferent,
              currentEditorLength: currentEditorContent?.content?.length || 0,
              newContentLength: content?.content?.length || 0
            })
            
            if (isEmpty || isDifferent) {
              editor.commands.setContent(content)
              lastSnapshotContentRef.current = contentStr
              pendingContentRef.current = null // Clear pending content
              console.log('Content set successfully in editor')
            } else {
              console.log('Content already matches, skipping set')
            }
          } catch (error) {
            console.error('Error setting editor content:', error)
            // Content will be loaded by the useEffect retry logic
          }
        } else {
          console.log('Editor not ready, content will be loaded by useEffect:', {
            hasEditor: !!editor,
            hasState: !!(editor?.state),
            hasDoc: !!(editor?.state?.doc)
          })
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
  
  // Load pending content when editor becomes ready
  useEffect(() => {
    if (editor && pendingContentRef.current) {
      // Use multiple retries with increasing delays to ensure editor is ready
      const trySetContent = (attempt = 0) => {
        if (attempt > 10) {
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
          if (!content) return
          
          // Check if editor has a valid state
          if (editor.state && editor.state.doc) {
            const contentStr = JSON.stringify(content)
            const currentEditorContent = editor.getJSON()
            const currentEditorContentStr = JSON.stringify(currentEditorContent)
            
            // Only set if different
            if (contentStr !== currentEditorContentStr) {
              console.log('Setting editor content from pending:', {
                attempt,
                contentLength: content.content?.length || 0,
                currentEditorLength: currentEditorContent.content?.length || 0
              })
              editor.commands.setContent(content)
              lastSnapshotContentRef.current = contentStr
            }
            pendingContentRef.current = null
          } else {
            // Retry after delay
            setTimeout(() => trySetContent(attempt + 1), 50 * (attempt + 1))
          }
        } catch (error) {
          console.error(`Error setting pending editor content (attempt ${attempt}):`, error)
          if (attempt < 10) {
            setTimeout(() => trySetContent(attempt + 1), 50 * (attempt + 1))
          } else {
            pendingContentRef.current = null
          }
        }
      }
      
      // Start trying immediately, then retry if needed
      trySetContent(0)
    }
  }, [editor])
  
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
        
        editor.commands.setContent(parsedContent)
        setShowHistory(false)
        showToast('Document restored', 'success')
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            className="text-4xl font-bold bg-transparent border-none outline-none w-full focus:ring-0 px-0 py-2 text-gray-900 placeholder-gray-400"
            placeholder="Untitled"
          />
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            {saving && <span className="text-gray-600">Saving...</span>}
            {!saving && useEditorStore.getState().hasUnsavedChanges && (
              <span className="text-amber-600">Unsaved changes</span>
            )}
            {!saving && !useEditorStore.getState().hasUnsavedChanges && (
              <span className="text-green-600">Saved</span>
            )}
            {editor && (
              <span className="text-xs">
                {editor.storage.characterCount.characters()} characters
                {editor.storage.characterCount.words() > 0 && ` • ${editor.storage.characterCount.words()} words`}
              </span>
            )}
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleManualSave}
              disabled={saving || !useEditorStore.getState().hasUnsavedChanges}
              className="hidden px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
            >
              History
            </button>
            {isPublic ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    const publicUrl = `${window.location.origin}/public/doc/${documentId}`
                    try {
                      await navigator.clipboard.writeText(publicUrl)
                      showToast('Public URL copied to clipboard', 'success')
                    } catch (err) {
                      // Fallback for older browsers
                      const textArea = document.createElement('textarea')
                      textArea.value = publicUrl
                      document.body.appendChild(textArea)
                      textArea.select()
                      document.execCommand('copy')
                      document.body.removeChild(textArea)
                      showToast('Public URL copied to clipboard', 'success')
                    }
                  }}
                  className="px-4 py-2 border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Public Link
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/documents/${documentId}/public`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ is_public: false })
                      })
                      if (response.ok) {
                        setIsPublic(false)
                        showToast('Document is now private', 'success')
                      } else {
                        showToast('Failed to make document private', 'error')
                      }
                    } catch (err) {
                      showToast('Failed to make document private', 'error')
                    }
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                >
                  Make Private
                </button>
              </div>
            ) : (
              <button
                onClick={async () => {
                  // First make document public
                  try {
                    const response = await fetch(`/api/documents/${documentId}/public`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ is_public: true })
                    })
                    if (response.ok) {
                      setIsPublic(true)
                      showToast('Document is now public', 'success')
                      // Copy URL after making public
                      const publicUrl = `${window.location.origin}/public/doc/${documentId}`
                      try {
                        await navigator.clipboard.writeText(publicUrl)
                        showToast('Public URL copied to clipboard', 'success')
                      } catch (err) {
                        // Fallback for older browsers
                        const textArea = document.createElement('textarea')
                        textArea.value = publicUrl
                        document.body.appendChild(textArea)
                        textArea.select()
                        document.execCommand('copy')
                        document.body.removeChild(textArea)
                      }
                    } else {
                      showToast('Failed to make document public', 'error')
                    }
                  } catch (err) {
                    showToast('Failed to make document public', 'error')
                  }
                }}
                className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Make Public & Copy Link
              </button>
            )}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setShowExportMenu(!showExportMenu)
                }}
                className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 relative z-10 transition-colors flex items-center gap-1"
              >
                Export
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showExportMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-30">
                    <button
                      onClick={() => {
                        handleExport('md')
                        setShowExportMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-md text-sm transition-colors"
                    >
                      Markdown
                    </button>
                    <button
                      onClick={() => {
                        handleExport('txt')
                        setShowExportMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm transition-colors"
                    >
                      Text
                    </button>
                    <button
                      onClick={() => {
                        handleExport('html')
                        setShowExportMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm transition-colors"
                    >
                      HTML
                    </button>
                    <button
                      onClick={() => {
                        handleExport('json')
                        setShowExportMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-md text-sm transition-colors"
                    >
                      JSON
                    </button>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => router.push('/drive')}
              className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
        
        {/* Editor */}
        <div className="bg-white rounded-md border border-gray-200">
          {editor && <EditorToolbar editor={editor} />}
          {editor && (
            <div className="border-t border-gray-200 min-h-[500px] focus-within:ring-2 focus-within:ring-black relative">
              <EditorContent editor={editor} />
              {editor && <BubbleMenu editor={editor} />}
              {editor && <FloatingMenu editor={editor} />}
              {slashMenuState && slashMenuState.active && (
                <SlashMenu
                  editor={editor}
                  menuState={slashMenuState}
                  onClose={() => setSlashMenuState(null)}
                />
              )}
              {insertBlockMenu && (
                <InsertBlockMenu
                  editor={editor}
                  position={insertBlockMenu.position}
                  onClose={() => setInsertBlockMenu(null)}
                />
              )}
            </div>
          )}
        </div>
      </div>
      
      {showHistory && (
        <HistoryPanel
          documentId={documentId}
          onRestore={handleRestore}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  )
}

