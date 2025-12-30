'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import DocumentList from '@/components/drive/DocumentList'
import FolderTree from '@/components/drive/FolderTree'
import SearchBar from '@/components/drive/SearchBar'
import { useToast } from '@/components/ui/toast'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function DrivePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [documents, setDocuments] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingDoc, setCreatingDoc] = useState(false)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const isSearchingRef = useRef(false)
  const hasLoadedRef = useRef(false)
  const isLoadingRef = useRef(false)

  const loadData = useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) {
      return
    }

    // Don't load data if we're currently showing search results
    if (isSearchingRef.current) {
      return
    }

    isLoadingRef.current = true
    setLoading(true)
    try {
      // Load all folders (not just root) to build complete tree
      const [docsRes, foldersRes] = await Promise.all([
        fetch('/api/documents?folder_id=null'),
        fetch('/api/folders') // Get all folders, not just root
      ])

      if (docsRes.ok) {
        const docsData = await docsRes.json()
        setDocuments(docsData.documents || [])
      }

      if (foldersRes.ok) {
        const foldersData = await foldersRes.json()
        // Build tree structure with all folders
        setFolders(foldersData.folders || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearchResults = useCallback((results) => {
    if (results) {
      // We have search results
      isSearchingRef.current = true
      setSearchResults(results)
      // Combine documents and folders from search
      const allItems = [
        ...(results.folders || []).map(f => ({ ...f, type: 'folder' })),
        ...(results.documents || []).map(d => ({ ...d, type: 'document' }))
      ]
      setDocuments(allItems)
      setFolders([]) // Clear folders when showing search results
    } else {
      // No search results - reset to normal view
      // Only reload if we were actually showing search results
      const wasSearching = isSearchingRef.current
      isSearchingRef.current = false
      setSearchResults(null)

      if (wasSearching) {
        // Only reload if we were actually in search mode
        loadData()
      }
    }
  }, [loadData])

  const createDocument = useCallback(async () => {
    setCreatingDoc(true)
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled', folder_id: null })
      })

      if (response.ok) {
        const data = await response.json()
        showToast(t?.documentCreated || 'Document created', 'success')
        // Open in same window - Tabs component will handle adding it to tabs
        router.push(`/doc/${data.document.id}`)
      } else {
        showToast(t?.failedToCreateDocument || 'Failed to create document', 'error')
      }
    } catch (error) {
      console.error('Error creating document:', error)
      showToast(t?.failedToCreateDocument || 'Failed to create document', 'error')
    } finally {
      setCreatingDoc(false)
    }
  }, [router, showToast])

  const createFolder = useCallback(async (name, parentId = null) => {
    if (!name || !name.trim()) return

    setCreatingFolder(true)
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), parent_id: parentId })
      })

      if (response.ok) {
        showToast(t?.folderCreated || 'Folder created', 'success')
        loadData()
        return true
      } else {
        showToast(t?.failedToCreateFolder || 'Failed to create folder', 'error')
        return false
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      showToast(t?.failedToCreateFolder || 'Failed to create folder', 'error')
      return false
    } finally {
      setCreatingFolder(false)
    }
  }, [loadData, showToast])

  const deleteDocument = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Dispatch event to close tab
        window.dispatchEvent(new CustomEvent('documentDeleted', {
          detail: { documentId: id }
        }))
        showToast(t?.documentDeleted || 'Document deleted', 'success')
        loadData()
      } else {
        showToast(t?.failedToDeleteDocument || 'Failed to delete document', 'error')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      showToast(t?.failedToDeleteDocument || 'Failed to delete document', 'error')
    }
  }, [loadData, showToast])

  const togglePublic = useCallback(async (id, isPublic) => {
    try {
      const response = await fetch(`/api/documents/${id}/public`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: isPublic })
      })

      if (response.ok) {
        // Update local state immediately
        setDocuments(prev => prev.map(doc =>
          doc.id === id ? { ...doc, is_public: isPublic } : doc
        ))
        showToast(isPublic ? (t?.nowPublic || 'Now public') : (t?.nowPrivate || 'Now private'), 'success')
      } else {
        showToast(t?.failedToUpdate || 'Failed to update', 'error')
      }
    } catch (error) {
      console.error('Error toggling public:', error)
      showToast(t?.failedToUpdate || 'Failed to update', 'error')
    }
  }, [showToast])

  const deleteFolder = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/folders/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showToast(t?.folderDeleted || 'Folder deleted', 'success')
        loadData()
      } else {
        showToast(t?.failedToDeleteFolder || 'Failed to delete folder', 'error')
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      showToast(t?.failedToDeleteFolder || 'Failed to delete folder', 'error')
    }
  }, [loadData, showToast])

  const moveItem = useCallback(async (itemId, itemType, targetFolderId) => {
    try {
      const endpoint = itemType === 'folder' ? `/api/folders/${itemId}` : `/api/documents/${itemId}`
      const field = itemType === 'folder' ? 'parent_id' : 'folder_id'

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: targetFolderId })
      })

      if (response.ok) {
        showToast(`${itemType === 'folder' ? (t?.folder || 'Folder') : (t?.document || 'Document')} ${t?.moved || 'moved'}`, 'success')
        loadData()
        return true
      } else {
        showToast(`${t?.failedToMove || 'Failed to move'} ${itemType === 'folder' ? (t?.folder || 'folder') : (t?.document || 'document')}`, 'error')
        return false
      }
    } catch (error) {
      console.error(`Error moving ${itemType}:`, error)
      showToast(`${t?.failedToMove || 'Failed to move'} ${itemType === 'folder' ? (t?.folder || 'folder') : (t?.document || 'document')}`, 'error')
      return false
    }
  }, [loadData, showToast])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{t?.drive || 'Drive'}</h1>
          <p className="text-xs md:text-sm text-gray-500">{t?.driveSubtitle || 'Manage your documents and folders'}</p>
        </div>

        <div className="mb-4 md:mb-6 max-w-2xl">
          <SearchBar onResults={handleSearchResults} />
        </div>

        <div className="bg-white border border-gray-200 rounded-md p-3 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">{t?.documents || 'Documents'}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const name = prompt(t?.enterFolderName || 'Enter folder name:')
                  if (name && name.trim()) {
                    await createFolder(name.trim(), null)
                  }
                }}
                disabled={creatingFolder}
                className="px-4 md:px-3 py-2.5 md:py-1.5 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-sm font-medium transition-colors flex items-center gap-1.5 md:gap-1"
              >
                <span className="text-base md:text-sm">+</span>
                <span className="text-sm md:text-sm">{creatingFolder ? (t?.creatingFolder || 'Creating...') : (t?.newFolder || 'New Folder')}</span>
              </button>
              <button
                onClick={createDocument}
                disabled={creatingDoc}
                className="px-4 md:px-3 py-2.5 md:py-1.5 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-sm font-medium transition-colors"
              >
                {creatingDoc ? (t?.creatingFolder || 'Creating...') : `+ ${t?.newDocument || 'New Document'}`}
              </button>
            </div>
          </div>
          <DocumentList
            documents={searchResults ? [
              ...(searchResults.folders || []).map(f => ({ ...f, type: 'folder' })),
              ...(searchResults.documents || []).map(d => ({ ...d, type: 'document' }))
            ] : [
              ...folders.map(f => ({ ...f, type: 'folder' })),
              ...documents.map(d => ({ ...d, type: 'document' }))
            ]}
            allFolders={folders}
            onDelete={(id) => {
              const item = [...folders, ...documents].find(i => i.id === id)
              if (item && 'name' in item) {
                // It's a folder
                deleteFolder(id)
              } else {
                deleteDocument(id)
              }
            }}
            onCreateFolder={createFolder}
            onMove={moveItem}
            onTogglePublic={togglePublic}
            currentFolderId={null}
            parentFolderId={null}
          />
        </div>
      </div>
    </div>
  )
}

