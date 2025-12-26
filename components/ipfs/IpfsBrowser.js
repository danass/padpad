'use client'

import { useState, useEffect, useCallback } from 'react'
import { HardDrive, Upload, X, Image, File, Loader2, Trash2, ExternalLink, FolderOpen, ChevronDown, Plus, Video, Music } from 'lucide-react'

export default function IpfsBrowser({ isOpen, onClose, onSelectFile }) {
    const [providers, setProviders] = useState([])
    const [selectedProvider, setSelectedProvider] = useState(null)
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)
    const [dragOver, setDragOver] = useState(false)
    const [showProviderDropdown, setShowProviderDropdown] = useState(false)

    // Load providers on open
    const loadProviders = useCallback(async () => {
        try {
            const response = await fetch('/api/ipfs/config')
            if (response.ok) {
                const data = await response.json()
                setProviders(data.providers || [])
                if (data.providers?.length > 0 && !selectedProvider) {
                    setSelectedProvider(data.providers[0])
                }
            } else {
                // Not logged in or error, just show empty
                setProviders([])
            }
        } catch (err) {
            console.error('Failed to load providers:', err)
            setProviders([])
        }
    }, [selectedProvider])


    // Load files for selected provider
    const loadFiles = useCallback(async () => {
        if (!selectedProvider) return

        setLoading(true)
        setError(null)
        setFiles([])

        try {
            let response

            if (selectedProvider.provider === 'filebase') {
                response = await fetch(`/api/ipfs/files?providerId=${selectedProvider.id}`)
            } else if (selectedProvider.provider === 'storacha_gateway') {
                response = await fetch(`/api/ipfs/gateway-files?cid=${selectedProvider.rootCid}&gateway=${selectedProvider.gateway || 'w3s.link'}`)
            }

            if (!response?.ok) {
                throw new Error('Failed to load files')
            }

            const data = await response.json()
            setFiles(data.files || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [selectedProvider])

    useEffect(() => {
        if (isOpen) {
            loadProviders()
        }
    }, [isOpen, loadProviders])

    useEffect(() => {
        if (selectedProvider) {
            loadFiles()
        }
    }, [selectedProvider, loadFiles])

    // Handle file upload (Filebase only)
    const handleUpload = async (uploadFiles) => {
        if (!uploadFiles?.length || !selectedProvider) return
        if (selectedProvider.provider !== 'filebase') {
            setError('Upload only supported for Filebase')
            return
        }

        setUploading(true)
        setError(null)

        try {
            for (const file of uploadFiles) {
                const urlResponse = await fetch('/api/ipfs/upload-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filename: file.name,
                        contentType: file.type || 'application/octet-stream',
                        providerId: selectedProvider.id,
                    }),
                })

                if (!urlResponse.ok) {
                    const err = await urlResponse.json()
                    throw new Error(err.error || 'Failed to get upload URL')
                }

                const { uploadUrl } = await urlResponse.json()

                const uploadResponse = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type || 'application/octet-stream',
                    },
                })

                if (!uploadResponse.ok) {
                    let errorMsg = `Failed to upload ${file.name}`
                    try {
                        const responseText = await uploadResponse.text()
                        const messageMatch = responseText.match(/<Message>(.*?)<\/Message>/)
                        if (messageMatch) {
                            errorMsg = messageMatch[1]
                        }
                    } catch (e) {
                        const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
                        errorMsg = `Upload failed for ${file.name} (${sizeMB} MB). Free Filebase accounts have a 25MB limit.`
                    }
                    throw new Error(errorMsg)
                }
            }

            await loadFiles()
        } catch (err) {
            setError(err.message)
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (key) => {
        if (!confirm('Delete this file?') || !selectedProvider) return
        if (selectedProvider.provider !== 'filebase') {
            setError('Delete only supported for Filebase')
            return
        }

        try {
            const response = await fetch(`/api/ipfs/files?key=${encodeURIComponent(key)}&providerId=${selectedProvider.id}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error('Failed to delete file')
            setFiles(files.filter(f => f.key !== key))
        } catch (err) {
            setError(err.message)
        }
    }

    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true) }
    const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false) }
    const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleUpload(Array.from(e.dataTransfer.files)) }
    const handleFileInput = (e) => { handleUpload(Array.from(e.target.files)); e.target.value = '' }

    const getFileIcon = (key) => {
        const ext = key.split('.').pop()?.toLowerCase()
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
        const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv']
        const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac']
        if (imageExts.includes(ext)) return <Image className="w-4 h-4 text-blue-500" />
        if (videoExts.includes(ext)) return <Video className="w-4 h-4 text-purple-500" />
        if (audioExts.includes(ext)) return <Music className="w-4 h-4 text-green-500" />
        return <File className="w-4 h-4 text-gray-400" />
    }

    const formatSize = (bytes) => {
        if (!bytes) return '-'
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const canUpload = selectedProvider?.provider === 'filebase'
    const canDelete = selectedProvider?.provider === 'filebase'

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

                    {/* Provider Selector */}
                    {providers.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                                className="flex items-center gap-2 px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
                            >
                                <span className="max-w-[150px] truncate">{selectedProvider?.name || 'Select storage'}</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {showProviderDropdown && (
                                <div className="absolute right-0 mt-1 w-56 bg-white border rounded-md shadow-lg z-10">
                                    {providers.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => { setSelectedProvider(p); setShowProviderDropdown(false) }}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${selectedProvider?.id === p.id ? 'bg-purple-50' : ''}`}
                                        >
                                            <span className="truncate">{p.name}</span>
                                            <span className="text-xs text-gray-400">
                                                {p.provider === 'filebase' ? 'Filebase' : 'Gateway'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {providers.length === 0 ? (
                        <div className="text-center py-12">
                            <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-600 mb-2">No storage configured</p>
                            <p className="text-sm text-gray-400">
                                Go to Settings → External Storage to add a provider.
                            </p>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
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
                            {/* Upload zone (only for Filebase) */}
                            {canUpload && (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-colors ${dragOver ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}`}
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
                                                Drag files or{' '}
                                                <label className="text-purple-600 hover:underline cursor-pointer">
                                                    browse
                                                    <input type="file" multiple className="hidden" onChange={handleFileInput} />
                                                </label>
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}

                            {!canUpload && selectedProvider && (
                                <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-md mb-4">
                                    This storage is read-only. Files can be viewed and inserted but not uploaded.
                                </div>
                            )}

                            {/* File list */}
                            {files.length === 0 ? (
                                <p className="text-center text-gray-400 py-8">No files found</p>
                            ) : (
                                <div className="space-y-1">
                                    {files.map((file) => (
                                        <div
                                            key={file.key}
                                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group cursor-pointer"
                                            onClick={() => onSelectFile?.(file)}
                                        >
                                            {file.gatewayUrl && file.key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                <img src={file.gatewayUrl} alt={file.key} className="w-10 h-10 object-cover rounded" />
                                            ) : (
                                                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded">
                                                    {getFileIcon(file.key)}
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{file.key}</p>
                                                <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {file.gatewayUrl && (
                                                    <a
                                                        href={file.gatewayUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 hover:bg-gray-100 rounded"
                                                        onClick={e => e.stopPropagation()}
                                                        title="Open in new tab"
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-gray-400" />
                                                    </a>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(file.key) }}
                                                        className="p-1.5 hover:bg-red-100 rounded text-red-500"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
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
                    Click a file to insert it into your document
                </div>
            </div>
        </div>
    )
}
