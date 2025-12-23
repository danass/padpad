'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { memo, useState } from 'react'
import { useRouter } from 'next/navigation'

function DocumentList({ documents, onDelete, onCreateFolder }) {
  const router = useRouter()
  const [contextMenu, setContextMenu] = useState(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)
  
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No documents yet</p>
        <p className="text-sm mt-2">Create a new document to get started</p>
      </div>
    )
  }
  
  const handleContextMenu = (e, item) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, item })
  }
  
  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !onCreateFolder) return
    setCreatingFolder(true)
    try {
      await onCreateFolder(newFolderName)
      setNewFolderName('')
      setContextMenu(null)
    } catch (error) {
      console.error('Error creating folder:', error)
    } finally {
      setCreatingFolder(false)
    }
  }
  
  return (
    <>
      <div className="space-y-0 border border-gray-200 rounded-md overflow-hidden">
        {documents.map((item) => (
          <div
            key={item.id}
            onContextMenu={(e) => handleContextMenu(e, item)}
            className="flex items-center justify-between px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 group transition-colors cursor-pointer"
          >
            {item.type === 'folder' ? (
              <Link
                href={`/drive/folder/${item.id}`}
                className="flex-1 flex items-center gap-4"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500">Folder</p>
                </div>
              </Link>
            ) : (
              <Link
                href={`/doc/${item.id}`}
                className="flex-1 flex items-center gap-4"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.title || 'Untitled'}</h3>
                  <p className="text-sm text-gray-500">
                    Updated {format(new Date(item.updated_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </Link>
            )}
            
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (confirm(`Are you sure you want to delete this ${item.type === 'folder' ? 'folder' : 'document'}?`)) {
                  onDelete(item.id)
                }
              }}
              className="opacity-0 group-hover:opacity-100 px-3 py-1 text-red-500 hover:bg-red-50 rounded transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setContextMenu(null)}
          />
          <div 
            className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.item?.type === 'folder' ? (
              <>
                <button
                  onClick={() => {
                    router.push(`/drive/folder/${contextMenu.item.id}`)
                    setContextMenu(null)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Open
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this folder?')) {
                      onDelete(contextMenu.item.id)
                    }
                    setContextMenu(null)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    router.push(`/doc/${contextMenu.item.id}`)
                    setContextMenu(null)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Open
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this document?')) {
                      onDelete(contextMenu.item.id)
                    }
                    setContextMenu(null)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                >
                  Delete
                </button>
              </>
            )}
            <div className="border-t border-gray-200 my-1" />
            <div className="px-4 py-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                placeholder="Folder name"
                className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-black"
                autoFocus
              />
              <button
                onClick={handleCreateFolder}
                disabled={creatingFolder || !newFolderName.trim()}
                className="mt-2 w-full px-3 py-1.5 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingFolder ? 'Creating...' : 'New Folder'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default memo(DocumentList)

