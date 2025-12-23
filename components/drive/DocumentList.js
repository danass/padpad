'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { memo, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

function DocumentList({ documents, allFolders = [], onDelete, onCreateFolder, onMove, currentFolderId = null, parentFolderId = null, onNavigateToParent }) {
  const router = useRouter()
  const [contextMenu, setContextMenu] = useState(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverFolder, setDragOverFolder] = useState(null)
  const [editingFolderPlaceholder, setEditingFolderPlaceholder] = useState(null)
  
  // Build folder map for quick lookup
  const folderMap = useMemo(() => {
    const map = new Map()
    allFolders.forEach(f => map.set(f.id, f))
    return map
  }, [allFolders])
  
  // Build tree structure with hierarchy
  const buildTree = useMemo(() => {
    const rootItems = []
    const itemMap = new Map()
    
    // First, create map of all items
    documents.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] })
    })
    
    // Then build tree structure
    documents.forEach(item => {
      const parentId = item.type === 'folder' ? item.parent_id : item.folder_id
      if (parentId && itemMap.has(parentId)) {
        itemMap.get(parentId).children.push(itemMap.get(item.id))
      } else {
        rootItems.push(itemMap.get(item.id))
      }
    })
    
    // Sort: folders first, then documents
    const sortItems = (items) => {
      return items.sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1
        if (a.type !== 'folder' && b.type === 'folder') return 1
        if (a.type === 'folder' && b.type === 'folder') {
          return (a.name || '').localeCompare(b.name || '')
        }
        return new Date(b.updated_at || 0) - new Date(a.updated_at || 0)
      })
    }
    
    const sortTree = (items) => {
      sortItems(items)
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          sortTree(item.children)
        }
      })
    }
    
    sortTree(rootItems)
    return rootItems
  }, [documents])
  
  // Render tree recursively
  const renderItem = (item, level = 0) => {
    const isDragging = draggedItem?.id === item.id
    const isDragOver = dragOverFolder === item.id && item.type === 'folder'
    
    return (
      <div key={item.id}>
        <div
          draggable={!!onMove}
          onDragStart={(e) => {
            setDraggedItem(item)
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id, type: item.type }))
          }}
          onDragEnd={() => {
            setDraggedItem(null)
            setDragOverFolder(null)
          }}
          onDragOver={(e) => {
            if (item.type === 'folder' && draggedItem && draggedItem.id !== item.id) {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              setDragOverFolder(item.id)
            }
          }}
          onDragLeave={() => {
            if (dragOverFolder === item.id) {
              setDragOverFolder(null)
            }
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation() // Prevent event bubbling to parent container
            if (item.type === 'folder' && draggedItem && draggedItem.id !== item.id && onMove) {
              // Prevent moving folder into itself or its children
              const isDescendant = (folderId, checkId) => {
                const folder = folderMap.get(checkId)
                if (!folder || !folder.parent_id) return false
                if (folder.parent_id === folderId) return true
                return isDescendant(folderId, folder.parent_id)
              }
              
              if (draggedItem.type === 'folder' && isDescendant(draggedItem.id, item.id)) {
                alert('Cannot move folder into its own subfolder')
                setDragOverFolder(null)
                setDraggedItem(null)
                return
              }
              
              onMove(draggedItem.id, draggedItem.type, item.id)
              setDraggedItem(null)
            }
            setDragOverFolder(null)
          }}
          onContextMenu={(e) => handleContextMenu(e, item)}
          className={`flex items-center justify-between px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 group transition-colors cursor-pointer ${
            isDragging ? 'opacity-50' : ''
          } ${isDragOver ? 'bg-blue-50 border-blue-200' : ''}`}
          style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
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
        
        {/* Render children recursively */}
        {item.children && item.children.length > 0 && (
          <div>
            {item.children.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }
  
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
      <div 
        className="space-y-0 border border-gray-200 rounded-md overflow-hidden"
        onDragOver={(e) => {
          if (draggedItem && onMove) {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
          }
        }}
        onDrop={(e) => {
          // Only handle drop if it wasn't already handled by a folder's onDrop
          // The folder's onDrop calls stopPropagation, so if we get here, it wasn't dropped on a folder
          if (draggedItem && onMove) {
            e.preventDefault()
            // Move to current folder (root if currentFolderId is null)
            onMove(draggedItem.id, draggedItem.type, currentFolderId)
            setDraggedItem(null)
          }
        }}
      >
        {buildTree.map(item => renderItem(item, 0))}
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
          </div>
        </>
      )}
    </>
  )
}

export default memo(DocumentList)
