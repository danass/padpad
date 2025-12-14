'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { memo } from 'react'

function DocumentList({ documents, onDelete }) {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No documents yet</p>
        <p className="text-sm mt-2">Create a new document to get started</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-0 border border-gray-200 rounded-md overflow-hidden">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 group transition-colors"
        >
          <Link
            href={`/doc/${doc.id}`}
            className="flex-1 flex items-center gap-4"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{doc.title || 'Untitled'}</h3>
              <p className="text-sm text-gray-500">
                Updated {format(new Date(doc.updated_at), 'MMM d, yyyy')}
              </p>
            </div>
          </Link>
          
          <button
            onClick={(e) => {
              e.preventDefault()
              if (confirm('Are you sure you want to delete this document?')) {
                onDelete(doc.id)
              }
            }}
            className="opacity-0 group-hover:opacity-100 px-3 py-1 text-red-500 hover:bg-red-50 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}

export default memo(DocumentList)

