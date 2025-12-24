'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DocumentList from '@/components/drive/DocumentList'
import FolderTree from '@/components/drive/FolderTree'

export default function FolderPage() {
  const params = useParams()
  const router = useRouter()
  const folderId = params.id
  const [folder, setFolder] = useState(null)
  const [documents, setDocuments] = useState([])
  const [children, setChildren] = useState([])
  const [allFolders, setAllFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingDoc, setCreatingDoc] = useState(false)
  
  useEffect(() => {
    loadData()
  }, [folderId])
  
  async function loadData() {
    setLoading(true)
    try {
      // Load folder data
      const folderRes = await fetch(`/api/folders/${folderId}`)
      if (folderRes.ok) {
        const folderData = await folderRes.json()
        setFolder(folderData.folder)
        setDocuments(folderData.documents || [])
        setChildren(folderData.children || [])
      }
      
      // Load all folders for tree
      const allFoldersRes = await fetch('/api/folders')
      if (allFoldersRes.ok) {
        const allFoldersData = await allFoldersRes.json()
        setAllFolders(allFoldersData.folders || [])
      }
    } catch (error) {
      console.error('Error loading folder:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function createDocument() {
    setCreatingDoc(true)
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled', folder_id: folderId })
      })
      
      if (response.ok) {
        const data = await response.json()
        router.push(`/doc/${data.document.id}`)
      }
    } catch (error) {
      console.error('Error creating document:', error)
    } finally {
      setCreatingDoc(false)
    }
  }
  
  async function deleteDocument(id) {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Dispatch event to close tab
        window.dispatchEvent(new CustomEvent('documentDeleted', {
          detail: { documentId: id }
        }))
        loadData()
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }
  
  async function togglePublic(id, isPublic) {
    try {
      const response = await fetch(`/api/documents/${id}/public`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: isPublic })
      })
      
      if (response.ok) {
        setDocuments(prev => prev.map(doc => 
          doc.id === id ? { ...doc, is_public: isPublic } : doc
        ))
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  if (!folder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Folder not found</p>
          <button
            onClick={() => router.push('/drive')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Drive
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/drive')}
              className="text-sm text-gray-600 hover:text-gray-900 mb-2 transition-colors"
            >
              ← Back to Drive
            </button>
            <h1 className="text-3xl font-bold text-gray-900">📁 {folder.name}</h1>
          </div>
          <button
            onClick={createDocument}
            disabled={creatingDoc}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            {creatingDoc ? 'Creating...' : '+ New Document'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FolderTree folders={allFolders} currentFolderId={folderId} />
          </div>
          
          <div className="lg:col-span-3">
            {children.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Subfolders</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => router.push(`/drive/folder/${child.id}`)}
                      className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="text-2xl mb-2">📁</div>
                      <div className="font-medium text-gray-900">{child.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-white border border-gray-200 rounded-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Documents</h2>
              <DocumentList 
                documents={documents} 
                onDelete={deleteDocument}
                onTogglePublic={togglePublic}
                onCreateFolder={async (name) => {
                  const response = await fetch('/api/folders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, parent_id: folderId })
                  })
                  if (response.ok) {
                    loadData()
                  }
                }}
                currentFolderId={folderId}
                parentFolderId={folder.parent_id}
                onNavigateToParent={() => {
                  if (folder.parent_id) {
                    router.push(`/drive/folder/${folder.parent_id}`)
                  } else {
                    router.push('/drive')
                  }
                }}
                allFolders={allFolders}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}





