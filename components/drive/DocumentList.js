'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { memo, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Grid, List, ListChecks, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

function DocumentList({ documents, allFolders = [], onDelete, onCreateFolder, onMove, onTogglePublic, currentFolderId = null, parentFolderId = null, onNavigateToParent }) {
  const router = useRouter()
  const [contextMenu, setContextMenu] = useState(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverFolder, setDragOverFolder] = useState(null)
  const [editingFolderPlaceholder, setEditingFolderPlaceholder] = useState(null)
  const [viewMode, setViewMode] = useState('list-no-icons') // 'compact', 'list-no-icons'
  const [sortBy, setSortBy] = useState('date') // 'date', 'name', 'type', 'visibility'
  const [sortDirection, setSortDirection] = useState('desc') // 'asc', 'desc'
  const [selectedItems, setSelectedItems] = useState(new Set()) // Multiple select
  
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
    } else if (sortBy === 'visibility') {
      return sorted.sort((a, b) => {
        // Folders don't have visibility, put them first
        if (a.type === 'folder' && b.type !== 'folder') return -1
        if (a.type !== 'folder' && b.type === 'folder') return 1
        if (a.type === 'folder' && b.type === 'folder') return 0
        // Sort by visibility
        const visA = a.is_public ? 1 : 0
        const visB = b.is_public ? 1 : 0
        return (visB - visA) * direction
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
  
  // Toggle selection
  const toggleSelection = (itemId) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  // Select all / Deselect all
  const toggleSelectAll = () => {
    if (selectedItems.size === sortedDocuments.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(sortedDocuments.map(d => d.id)))
    }
  }

  // Delete selected items
  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) return
    if (confirm(`Are you sure you want to delete ${selectedItems.size} item(s)?`)) {
      selectedItems.forEach(id => {
        onDelete(id)
      })
      setSelectedItems(new Set())
    }
  }

  // Set visibility for selected documents
  const handleSetVisibility = (isPublic) => {
    if (selectedItems.size === 0 || !onTogglePublic) return
    // Only apply to documents, not folders
    const selectedDocs = sortedDocuments.filter(d => selectedItems.has(d.id) && d.type !== 'folder')
    selectedDocs.forEach(doc => {
      onTogglePublic(doc.id, isPublic)
    })
    setSelectedItems(new Set())
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
    const isSelected = selectedItems.has(item.id)
    
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
          className={`grid grid-cols-12 gap-1 md:gap-4 items-center px-2 md:px-4 py-2.5 md:py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 group transition-colors cursor-pointer ${
            isDragging ? 'opacity-50' : ''
          } ${isDragOver ? 'bg-blue-50 border-blue-200' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
        >
          <div className="col-span-1 flex items-center gap-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                toggleSelection(item.id)
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
          {item.type === 'folder' ? (
            <Link href={`/drive/folder/${item.id}`} className="col-span-5 flex items-center gap-2">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <h3 className="font-medium text-sm md:text-base truncate">{item.name}</h3>
            </Link>
          ) : (
            <Link href={`/doc/${item.id}`} className="col-span-5 flex items-center gap-2">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="font-medium text-sm md:text-base truncate">{item.title || 'Untitled'}</h3>
            </Link>
          )}
          <div className="col-span-1 text-xs md:text-sm text-gray-600 whitespace-nowrap hidden md:block">
            {item.type === 'folder' ? 'Folder' : 'Doc'}
          </div>
          <div className="col-span-3 md:col-span-2 text-xs md:text-sm text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
            <span className="hidden md:inline">{format(new Date(item.updated_at || item.created_at), 'MMM d, yyyy')}</span>
            <span className="md:hidden">{format(new Date(item.updated_at || item.created_at), 'MMM d')}</span>
          </div>
          <div className="col-span-2 flex justify-center">
            {item.type !== 'folder' && onTogglePublic && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onTogglePublic(item.id, !item.is_public)
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  item.is_public 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={item.is_public ? 'Public - Click to make private' : 'Private - Click to make public'}
              >
                {item.is_public ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            )}
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
              className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
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
      <div className="flex items-center justify-between mb-3 md:mb-4 pb-3 md:pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 flex-wrap">
          {selectedItems.size > 0 && (
            <>
            <button
              onClick={handleDeleteSelected}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete ({selectedItems.size})
              </button>
              {onTogglePublic && (
                <>
                  <button
                    onClick={() => handleSetVisibility(true)}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    title="Make selected documents public"
                  >
                    Public
                  </button>
                  <button
                    onClick={() => handleSetVisibility(false)}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    title="Make selected documents private"
                  >
                    Private
            </button>
                </>
              )}
            </>
          )}
          <span className="text-xs md:text-sm text-gray-600">View:</span>
          <button
            onClick={() => setViewMode('compact')}
            className={`p-2.5 md:p-2 rounded transition-colors ${
              viewMode === 'compact' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Compact grid view"
          >
            <Grid className="w-5 h-5 md:w-4 md:h-4" />
          </button>
          <button
            onClick={() => setViewMode('list-no-icons')}
            className={`p-2.5 md:p-2 rounded transition-colors ${
              viewMode === 'list-no-icons' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="List view"
          >
            <List className="w-5 h-5 md:w-4 md:h-4" />
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
              <div className="grid grid-cols-12 gap-1 md:gap-4 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-700">
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === sortedDocuments.length && sortedDocuments.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => handleSort('name')}
                  className="col-span-5 md:col-span-5 flex items-center gap-1 md:gap-2 text-left hover:text-gray-900 transition-colors"
                >
                  <span className="truncate">Name</span>
                  {sortBy === 'name' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" /> : <ArrowDown className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 md:w-4 md:h-4 opacity-30 flex-shrink-0" />
                  )}
                </button>
                <button
                  onClick={() => handleSort('type')}
                  className="col-span-1 hidden md:flex items-center gap-1 md:gap-2 text-left hover:text-gray-900 transition-colors"
                >
                  <span className="truncate">Type</span>
                  {sortBy === 'type' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" /> : <ArrowDown className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 md:w-4 md:h-4 opacity-30 flex-shrink-0" />
                  )}
                </button>
                <button
                  onClick={() => handleSort('date')}
                  className="col-span-3 md:col-span-2 flex items-center gap-1 md:gap-2 text-left hover:text-gray-900 transition-colors"
                >
                  <span className="truncate">Date</span>
                  {sortBy === 'date' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" /> : <ArrowDown className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 md:w-4 md:h-4 opacity-30 flex-shrink-0" />
                  )}
                </button>
                <button
                  onClick={() => handleSort('visibility')}
                  className="col-span-2 md:col-span-2 flex items-center gap-1 text-left hover:text-gray-900 transition-colors"
                >
                  <span className="truncate hidden md:inline">Visibility</span>
                  <svg className="w-4 h-4 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {sortBy === 'visibility' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" /> : <ArrowDown className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 md:w-4 md:h-4 opacity-30 flex-shrink-0" />
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
