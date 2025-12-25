'use client'

import { useState, useEffect, useCallback } from 'react'
import { HardDrive, Upload, X, Image, File, Loader2, Trash2, ExternalLink, FolderOpen } from 'lucide-react'

export default function IpfsBrowser({ isOpen, onClose, onSelectFile }) {
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)
    const [configured, setConfigured] = useState(null) // null = checking, true/false = result
    const [dragOver, setDragOver] = useState(false)

    // Check if IPFS is configured and load files
    const loadFiles = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/ipfs/files')
            if (response.status === 400) {
                const data = await response.json()
                if (data.error === 'IPFS not configured') {
                    setConfigured(false)
                    return
                }
            }
            if (!response.ok) throw new Error('Failed to load files')

            const data = await response.json()
            setFiles(data.files || [])
            setConfigured(true)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            loadFiles()
        }
    }, [isOpen, loadFiles])

    // Handle file upload
    const handleUpload = async (uploadFiles) => {
        if (!uploadFiles?.length) return

        setUploading(true)
        setError(null)

        try {
            for (const file of uploadFiles) {
                const formData = new FormData()
                formData.append('file', file)

                const response = await fetch('/api/ipfs/files', {
                    method: 'POST',
                    body: formData,
                })

                if (!response.ok) throw new Error('Failed to upload file')
            }

            // Reload files after upload
            await loadFiles()
        } catch (err) {
            setError(err.message)
        } finally {
            setUploading(false)
        }
    }

    // Handle file delete
    const handleDelete = async (key) => {
        if (!confirm('Delete this file?')) return

        try {
            const response = await fetch(`/api/ipfs/files?key=${encodeURIComponent(key)}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error('Failed to delete file')

            setFiles(files.filter(f => f.key !== key))
        } catch (err) {
            setError(err.message)
        }
    }

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setDragOver(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const droppedFiles = Array.from(e.dataTransfer.files)
        handleUpload(droppedFiles)
    }

    // Handle file input change
    const handleFileInput = (e) => {
        const selectedFiles = Array.from(e.target.files)
        handleUpload(selectedFiles)
        e.target.value = '' // Reset input
    }

    // Get file icon based on type
    const getFileIcon = (key) => {
        const ext = key.split('.').pop()?.toLowerCase()
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
        if (imageExts.includes(ext)) {
            return <Image className="w-4 h-4 text-blue-500" />
        }
        return <File className="w-4 h-4 text-gray-400" />
    }

    // Format file size
    const formatSize = (bytes) => {
        if (!bytes) return '-'
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <HardDrive className="w-5 h-5 text-purple-600" />
                        <h2 className="text-lg font-semibold">IPFS Storage</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {configured === null || loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : configured === false ? (
                        <div className="text-center py-12">
                            <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-600 mb-2">IPFS not configured</p>
                            <p className="text-sm text-gray-400">
                                Go to Settings → External Storage to connect your IPFS provider.
                            </p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-500">{error}</p>
                            <button onClick={loadFiles} className="mt-2 text-sm text-blue-600 hover:underline">
                                Retry
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Upload zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-colors ${dragOver ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                                    }`}
                            >
                                {uploading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Uploading...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600">
                                            Drag files here or{' '}
                                            <label className="text-purple-600 hover:underline cursor-pointer">
                                                browse
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="hidden"
                                                    onChange={handleFileInput}
                                                />
                                            </label>
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* File list */}
                            {files.length === 0 ? (
                                <p className="text-center text-gray-400 py-8">No files yet</p>
                            ) : (
                                <div className="space-y-1">
                                    {files.map((file) => (
                                        <div
                                            key={file.key}
                                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group"
                                            draggable
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData('text/plain', file.gatewayUrl || '')
                                                e.dataTransfer.setData('application/ipfs', JSON.stringify(file))
                                            }}
                                        >
                                            {/* Thumbnail or icon */}
                                            {file.gatewayUrl && file.key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                <img
                                                    src={file.gatewayUrl}
                                                    alt={file.key}
                                                    className="w-10 h-10 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded">
                                                    {getFileIcon(file.key)}
                                                </div>
                                            )}

                                            {/* File info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{file.key}</p>
                                                <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onSelectFile?.(file)}
                                                    className="p-1.5 hover:bg-purple-100 rounded text-purple-600"
                                                    title="Insert into document"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                {file.gatewayUrl && (
                                                    <a
                                                        href={file.gatewayUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 hover:bg-gray-100 rounded"
                                                        title="Open in new tab"
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-gray-400" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(file.key)}
                                                    className="p-1.5 hover:bg-red-100 rounded text-red-500"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 text-xs text-gray-500">
                    Drag files from here to insert into your document
                </div>
            </div>
        </div>
    )
}
