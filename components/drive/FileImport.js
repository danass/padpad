'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function FileImport({ folderId = null }) {
  const { t } = useLanguage()
  const [dragging, setDragging] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)
  const router = useRouter()
  const { showToast } = useToast()
  
  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }
  
  const handleDragLeave = () => {
    setDragging(false)
  }
  
  const handleDrop = async (e) => {
    e.preventDefault()
    setDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    await processFiles(files)
  }
  
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    await processFiles(files)
  }
  
  const processFiles = async (files) => {
    for (const file of files) {
      if (file.type === 'text/plain' || 
          file.type === 'text/markdown' ||
          file.name.endsWith('.txt') ||
          file.name.endsWith('.md')) {
        await importFile(file)
      }
    }
  }
  
  const importFile = async (file) => {
    setImporting(true)
    try {
      const text = await file.text()
      
      // Parse markdown/text to TipTap JSON
      const content = parseToTipTapJSON(text, file.name.endsWith('.md'))
      
      // Create document
      const docResponse = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: file.name.replace(/\.(txt|md)$/i, ''),
          folder_id: folderId
        })
      })
      
      if (!docResponse.ok) {
        throw new Error('Failed to create document')
      }
      
      const docData = await docResponse.json()
      const docId = docData.document.id
      
      // Create initial snapshot
      await fetch(`/api/documents/${docId}/snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_json: content })
      })
      
      // Navigate to document
      showToast(t?.fileImported || 'File imported successfully', 'success')
      router.push(`/doc/${docId}`)
    } catch (error) {
      console.error('Error importing file:', error)
      showToast((t?.failedToImport || 'Failed to import file') + ': ' + error.message, 'error')
    } finally {
      setImporting(false)
    }
  }
  
  const parseToTipTapJSON = (text, isMarkdown) => {
    // Simple parser - converts text/markdown to TipTap JSON
    // This is a simplified version - in production, use a proper markdown parser
    
    if (!isMarkdown) {
      // Plain text - just create paragraphs
      const lines = text.split('\n').filter(l => l.trim())
      return {
        type: 'doc',
        content: lines.map(line => ({
          type: 'paragraph',
          content: line ? [{ type: 'text', text: line }] : []
        }))
      }
    }
    
    // Markdown - basic parsing
    const lines = text.split('\n')
    const content = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.startsWith('# ')) {
        content.push({
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: line.substring(2).trim() }]
        })
      } else if (line.startsWith('## ')) {
        content.push({
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: line.substring(3).trim() }]
        })
      } else if (line.startsWith('### ')) {
        content.push({
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: line.substring(4).trim() }]
        })
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        const listItems = []
        while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
          listItems.push({
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: lines[i].substring(2).trim() }]
            }]
          })
          i++
        }
        i-- // Adjust for loop increment
        if (listItems.length > 0) {
          content.push({
            type: 'bulletList',
            content: listItems
          })
        }
      } else if (line.trim()) {
        // Regular paragraph
        content.push({
          type: 'paragraph',
          content: [{ type: 'text', text: line.trim() }]
        })
      } else {
        // Empty line
        content.push({
          type: 'paragraph',
          content: []
        })
      }
    }
    
    return {
      type: 'doc',
      content: content.length > 0 ? content : [{ type: 'paragraph', content: [] }]
    }
  }
  
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        dragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md"
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />
      
      {importing ? (
        <div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p>{t?.importing || 'Importing...'}</p>
        </div>
      ) : (
        <>
          <p className="text-lg mb-2">📄 {t?.dropFilesHere || 'Drop .txt or .md files here'}</p>
          <p className="text-sm text-gray-500 mb-4">{t?.or || 'or'}</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t?.selectFiles || 'Select Files'}
          </button>
        </>
      )}
    </div>
  )
}

