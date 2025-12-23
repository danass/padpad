'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function FolderTree({ folders, currentFolderId = null }) {
  const [expanded, setExpanded] = useState({})
  
  const toggleExpanded = (folderId) => {
    setExpanded(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }))
  }
  
  // Build tree structure
  const rootFolders = folders.filter(f => !f.parent_id)
  const folderMap = new Map(folders.map(f => [f.id, f]))
  
  const renderFolder = (folder, level = 0) => {
    const children = folders.filter(f => f.parent_id === folder.id)
    const hasChildren = children.length > 0
    const isExpanded = expanded[folder.id]
    const isActive = currentFolderId === folder.id
    
    return (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-50 transition-colors ${
            isActive ? 'bg-gray-100' : ''
          }`}
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(folder.id)}
              className="w-4 h-4 flex items-center justify-center"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <span className="w-4" />}
          
          <Link
            href={`/drive/folder/${folder.id}`}
            className="flex-1 flex items-center gap-2"
          >
            <span>📁</span>
            <span>{folder.name}</span>
          </Link>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="border border-gray-200 rounded-md p-4 bg-white">
      <h3 className="font-semibold mb-3 text-gray-900">Folders</h3>
      <div className="space-y-1">
        {rootFolders.map(folder => renderFolder(folder))}
      </div>
    </div>
  )
}





