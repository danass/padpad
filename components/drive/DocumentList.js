'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { memo, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Grid, List, ListChecks, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

function DocumentList({ documents, allFolders = [], onDelete, onCreateFolder, onMove, currentFolderId = null, parentFolderId = null, onNavigateToParent }) {
  const router = useRouter()
  const [contextMenu, setContextMenu] = useState(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverFolder, setDragOverFolder] = useState(null)
  const [editingFolderPlaceholder, setEditingFolderPlaceholder] = useState(null)
  const [viewMode, setViewMode] = useState('list-no-icons') // 'compact', 'list-no-icons'
  const [sortBy, setSortBy] = useState('date') // 'date', 'name', 'type'
  const [sortDirection, setSortDirection] = useState('desc') // 'asc', 'desc'
  
  // Build folder map for quick lookup
  const folderMap = useMemo(() => {
    const map = new Map()
    allFolders.forEach(f => map.set(f.id, f))
    return map
  }, [allFolders])
  
  // Sort documents based on sortBy option and direction
  const sortedDocuments = useMemo(() => {
    const sorted = [...documents]
    const direction = sortDirection === 'asc' ? 1 : -1
    
    if (sortBy === 'name') {
      return sorted.sort((a, b) => {
        const nameA = (a.type === 'folder' ? a.name : a.title) || ''
        const nameB = (b.type === 'folder' ? b.name : b.title) || ''
        return nameA.localeCompare(nameB) * direction
      })
    } else if (sortBy === 'type') {
      return sorted.sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1 * direction
        if (a.type !== 'folder' && b.type === 'folder') return 1 * direction
        const nameA = (a.type === 'folder' ? a.name : a.title) || ''
        const nameB = (b.type === 'folder' ? b.name : b.title) || ''
        return nameA.localeCompare(nameB) * direction
      })
    } else { // date (default)
      return sorted.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0)
        const dateB = new Date(b.updated_at || b.created_at || 0)
        return (dateB - dateA) * direction
      })
    }
  }, [documents, sortBy, sortDirection])
  
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new column and default to desc
      setSortBy(column)
      setSortDirection('desc')
    }
  }
  
  // Build tree structure with hierarchy (only for list-no-icons view)
  const buildTree = useMemo(() => {
    if (viewMode === 'compact') {
      return sortedDocuments.map(item => ({ ...item, children: [] }))
    }
    
    const rootItems = []
    const itemMap = new Map()
    
    // First, create map of all items
    sortedDocuments.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] })
    })
    
    // Then build tree structure
    sortedDocuments.forEach(item => {
      const parentId = item.type === 'folder' ? item.parent_id : item.folder_id
      if (parentId && itemMap.has(parentId)) {
        itemMap.get(parentId).children.push(itemMap.get(item.id))
      } else {
        rootItems.push(itemMap.get(item.id))
      }
    })
    
    // Don't re-sort - already sorted in sortedDocuments
    // Just maintain the order from sortedDocuments
    return rootItems
  }, [sortedDocuments, viewMode])
  
  // Render item for compact grid view
  const renderCompactGridItem = (item) => {
    const isDragging = draggedItem?.id === item.id
    
    return (
      <div
        key={item.id}
        draggable={!!onMove}
        onDragStart={(e) => {
          setDraggedItem(item)
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id, type: item.type }))
        }}
        onDragEnd={() => setDraggedItem(null)}
        onContextMenu={(e) => handleContextMenu(e, item)}
        className={`p-3 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        {item.type === 'folder' ? (
          <Link href={`/drive/folder/${item.id}`} className="block">
            {viewMode !== 'list-no-icons' && (
              <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            )}
            <h3 className="font-medium text-sm truncate">{item.name}</h3>
            <p className="text-xs text-gray-500 mt-1">Folder</p>
          </Link>
        ) : (
          <Link href={`/doc/${item.id}`} className="block">
            {viewMode !== 'list-no-icons' && (
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            <h3 className="font-medium text-sm truncate">{item.title || 'Untitled'}</h3>
            <p className="text-xs text-gray-500 mt-1">{format(new Date(item.updated_at), 'MMM d, yyyy')}</p>
          </Link>
        )}
      </div>
    )
  }
  
  // Render item for list view (with icons)
  const renderListNoIconsItem = (item, level = 0) => {
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
          className={`grid grid-cols-12 gap-4 items-center px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 group transition-colors cursor-pointer ${
            isDragging ? 'opacity-50' : ''
          } ${isDragOver ? 'bg-blue-50 border-blue-200' : ''}`}
        >
          <div className="col-span-1">
            {item.type === 'folder' ? (
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </div>
          {item.type === 'folder' ? (
            <Link href={`/drive/folder/${item.id}`} className="col-span-5">
              <h3 className="font-medium">{item.name}</h3>
            </Link>
          ) : (
            <Link href={`/doc/${item.id}`} className="col-span-5">
              <h3 className="font-medium">{item.title || 'Untitled'}</h3>
            </Link>
          )}
          <div className="col-span-2 text-sm text-gray-600">
            {item.type === 'folder' ? 'Folder' : 'Document'}
          </div>
          <div className="col-span-3 text-sm text-gray-500">
            {format(new Date(item.updated_at || item.created_at), 'MMM d, yyyy')}
          </div>
          <div className="col-span-1 flex justify-end">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (confirm(`Are you sure you want to delete this ${item.type === 'folder' ? 'folder' : 'document'}?`)) {
                  onDelete(item.id)
                }
              }}
              className="opacity-0 group-hover:opacity-100 px-2 py-1 text-red-500 hover:bg-red-50 rounded transition-colors text-sm"
            >
              Delete
            </button>
          </div>
        </div>
        
        {/* Render children recursively */}
        {item.children && item.children.length > 0 && (
          <div>
            {item.children.map(child => renderListNoIconsItem(child, level + 1))}
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
      {/* View and Sort Controls */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">View:</span>
          <button
            onClick={() => setViewMode('compact')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'compact' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Compact grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list-no-icons')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list-no-icons' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div 
        className={viewMode === 'compact' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3' : ''}
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
        {viewMode === 'compact' ? (
          buildTree.map(item => renderCompactGridItem(item))
        ) : (
          <div className="border border-gray-200 rounded-md overflow-hidden">
            {/* Table header with sortable columns */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-700">
                <div className="col-span-1"></div>
                <button
                  onClick={() => handleSort('name')}
                  className="col-span-5 flex items-center gap-2 text-left hover:text-gray-900 transition-colors"
                >
                  <span>Name</span>
                  {sortBy === 'name' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-30" />
                  )}
                </button>
                <button
                  onClick={() => handleSort('type')}
                  className="col-span-2 flex items-center gap-2 text-left hover:text-gray-900 transition-colors"
                >
                  <span>Type</span>
                  {sortBy === 'type' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-30" />
                  )}
                </button>
                <button
                  onClick={() => handleSort('date')}
                  className="col-span-3 flex items-center gap-2 text-left hover:text-gray-900 transition-colors"
                >
                  <span>Date</span>
                  {sortBy === 'date' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-30" />
                  )}
                </button>
                <div className="col-span-1"></div>
              </div>
            </div>
            {/* Table body */}
            <div>
              {buildTree.map(item => renderListNoIconsItem(item, 0))}
            </div>
          </div>
        )}
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
