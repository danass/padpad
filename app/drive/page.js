'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DocumentList from '../../components/drive/DocumentList'
import FolderTree from '../../components/drive/FolderTree'
import SearchBar from '../../components/drive/SearchBar'
import { useToast } from '../../components/ui/toast'

export default function DrivePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [documents, setDocuments] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingDoc, setCreatingDoc] = useState(false)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // First, assign any orphaned documents to current user (one-time migration)
      try {
        await fetch('/api/migrate-assign-orphans', { method: 'POST' })
      } catch (err) {
        // Ignore errors, continue loading
      }
      
      const [docsRes, foldersRes] = await Promise.all([
        fetch('/api/documents?folder_id=null'),
        fetch('/api/folders?parent_id=null')
      ])
      
      if (docsRes.ok) {
        const docsData = await docsRes.json()
        setDocuments(docsData.documents || [])
      }
      
      if (foldersRes.ok) {
        const foldersData = await foldersRes.json()
        setFolders(foldersData.folders || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const handleSearchResults = useCallback((results) => {
    setSearchResults(results)
    if (results) {
      // Combine documents and folders from search
      const allItems = [
        ...(results.folders || []).map(f => ({ ...f, type: 'folder' })),
        ...(results.documents || []).map(d => ({ ...d, type: 'document' }))
      ]
      setDocuments(allItems)
      setFolders([]) // Clear folders when showing search results
    } else {
      // Reset to normal view - reload data
      loadData()
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
        showToast('Document created', 'success')
        // Open in same window - Tabs component will handle adding it to tabs
        router.push(`/doc/${data.document.id}`)
      } else {
        showToast('Failed to create document', 'error')
      }
    } catch (error) {
      console.error('Error creating document:', error)
      showToast('Failed to create document', 'error')
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
        showToast('Folder created', 'success')
        loadData()
        return true
      } else {
        showToast('Failed to create folder', 'error')
        return false
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      showToast('Failed to create folder', 'error')
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
        showToast('Document deleted', 'success')
        loadData()
      } else {
        showToast('Failed to delete document', 'error')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      showToast('Failed to delete document', 'error')
    }
  }, [loadData, showToast])
  
  const deleteFolder = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/folders/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        showToast('Folder deleted', 'success')
        loadData()
      } else {
        showToast('Failed to delete folder', 'error')
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      showToast('Failed to delete folder', 'error')
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Drive</h1>
            <p className="text-sm text-gray-500">Manage your documents and folders</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={createDocument}
              disabled={creatingDoc}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {creatingDoc ? 'Creating...' : '+ New Document'}
            </button>
          </div>
        </div>
        
        <div className="mb-6 max-w-2xl">
          <SearchBar onResults={handleSearchResults} />
        </div>
        
        <div className="bg-white border border-gray-200 rounded-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
            <button
              onClick={createDocument}
              disabled={creatingDoc}
              className="px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {creatingDoc ? 'Creating...' : '+ New Document'}
            </button>
          </div>
          <DocumentList 
            documents={searchResults ? [
              ...(searchResults.folders || []).map(f => ({ ...f, type: 'folder' })),
              ...(searchResults.documents || []).map(d => ({ ...d, type: 'document' }))
            ] : [
              ...folders.map(f => ({ ...f, type: 'folder' })),
              ...documents.map(d => ({ ...d, type: 'document' }))
            ]} 
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
          />
        </div>
      </div>
    </div>
  )
}

