'use client'

import { useEffect, useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Save, Edit, RotateCcw, Trash2 } from 'lucide-react'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function HistoryPanel({ documentId, onRestore, onClose }) {
  const { t } = useLanguage()
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (!documentId) return

    async function loadHistory() {
      setLoading(true)
      try {
        const response = await fetch(`/api/documents/${documentId}/history`)
        if (response.ok) {
          const data = await response.json()
          setHistory(data)
        }
      } catch (error) {
        console.error('Error loading history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [documentId])

  // Only show snapshots, not events
  const snapshots = useMemo(() => {
    if (!history) return []
    // Only return snapshots, sorted by date DESC (newest first)
    return (history.snapshots || []).map(s => {
      // Check if snapshot is empty (just empty paragraph)
      const isEmpty = (() => {
        if (!s.content_json) return true
        let content = s.content_json
        if (typeof content === 'string') {
          try {
            content = JSON.parse(content)
          } catch (e) {
            return false
          }
        }
        if (!content || content.type !== 'doc' || !content.content) return true
        if (content.content.length === 0) return true
        // Check if all paragraphs are empty
        return content.content.every(node => {
          if (node.type === 'paragraph' || node.type === 'heading') {
            if (!node.content || !Array.isArray(node.content)) return true
            return !node.content.some(child =>
              child.type === 'text' && child.text && child.text.trim().length > 0
            )
          }
          return false
        })
      })()
      return { ...s, type: 'snapshot', isEmpty }
    })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [history])

  const handleRestore = async (snapshot) => {
    if (!onRestore) return

    setRestoring(snapshot.id)

    try {
      let content = null

      // Direct restore from snapshot
      if (snapshot.content_json) {
        // Parse if it's a string
        if (typeof snapshot.content_json === 'string') {
          try {
            content = JSON.parse(snapshot.content_json)
          } catch (e) {
            console.error('Error parsing snapshot content_json:', e)
            content = snapshot.content_json
          }
        } else {
          content = snapshot.content_json
        }
      }

      if (content) {
        onRestore(content)
        // Don't close the panel after restore
      } else {
        console.error('Could not restore: no content found')
      }
    } catch (error) {
      console.error('Error restoring:', error)
    } finally {
      setRestoring(null)
    }
  }

  const handleDelete = async (snapshot, e) => {
    e.stopPropagation()

    if (!confirm(t?.confirmDeleteSnapshot || 'Are you sure you want to delete this snapshot?')) {
      return
    }

    setDeleting(snapshot.id)

    try {
      const response = await fetch(`/api/documents/${documentId}/snapshot/${snapshot.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete snapshot')
      }

      // Reload history
      const historyResponse = await fetch(`/api/documents/${documentId}/history`)
      if (historyResponse.ok) {
        const data = await historyResponse.json()
        setHistory(data)
      }
    } catch (error) {
      console.error('Error deleting snapshot:', error)
      alert((t?.failedToDelete || 'Failed to delete') + ': ' + error.message)
    } finally {
      setDeleting(null)
    }
  }

  const handleDeleteAllEmpty = async () => {
    const emptySnapshots = snapshots.filter(s => s.isEmpty)
    if (emptySnapshots.length === 0) {
      alert(t?.noSnapshotsYet || 'No empty snapshots found')
      return
    }

    const confirmMsg = (t?.confirmDeleteEmptySnapshots || 'Are you sure you want to delete {count} empty snapshot(s)?').replace('{count}', emptySnapshots.length)
    if (!confirm(confirmMsg)) {
      return
    }

    try {
      // Delete all empty snapshots
      const deletePromises = emptySnapshots.map(snapshot =>
        fetch(`/api/documents/${documentId}/snapshot/${snapshot.id}`, {
          method: 'DELETE'
        })
      )

      await Promise.all(deletePromises)

      // Reload history
      const historyResponse = await fetch(`/api/documents/${documentId}/history`)
      if (historyResponse.ok) {
        const data = await historyResponse.json()
        setHistory(data)
      }
    } catch (error) {
      console.error('Error deleting empty snapshots:', error)
      alert((t?.failedToDelete || 'Failed to delete') + ': ' + error.message)
    }
  }

  const handleDeleteAllButLast = async () => {
    if (snapshots.length <= 1) {
      alert(t?.onlyOneSnapshot || 'Only one snapshot exists')
      return
    }

    // First snapshot in array is the newest (sorted DESC)
    const toDelete = snapshots.slice(1)
    const confirmMsg = (t?.confirmDeleteAllButLast || 'Delete {count} old snapshot(s)? Only the most recent will be kept.').replace('{count}', toDelete.length)
    if (!confirm(confirmMsg)) {
      return
    }

    try {
      setDeleting('all')

      // Delete all except the first (newest)
      const deletePromises = toDelete.map(snapshot =>
        fetch(`/api/documents/${documentId}/snapshot/${snapshot.id}`, {
          method: 'DELETE'
        })
      )

      await Promise.all(deletePromises)

      // Reload history
      const historyResponse = await fetch(`/api/documents/${documentId}/history`)
      if (historyResponse.ok) {
        const data = await historyResponse.json()
        setHistory(data)
      }
    } catch (error) {
      console.error('Error deleting old snapshots:', error)
      alert((t?.failedToDelete || 'Failed to delete') + ': ' + error.message)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-lg z-[200] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{t?.history || 'History'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors">
            ✕
          </button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }

  const emptyCount = snapshots.filter(s => s.isEmpty).length

  return (
    <div
      className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-lg z-[200] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{t?.history || 'History'}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {snapshots.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteAllButLast()
                  }}
                  disabled={deleting === 'all'}
                  className="text-xs text-gray-600 hover:text-gray-800 underline disabled:opacity-50"
                >
                  {deleting === 'all' ? (t?.deleting || 'Deleting...') : (t?.keepOnlyLast || 'Keep only last')}
                </button>
              )}
              {emptyCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteAllEmpty()
                  }}
                  className="text-xs text-red-600 hover:text-red-700 underline"
                >
                  {t?.deleteEmptySnapshots || `Delete ${emptyCount} empty`}
                </button>
              )}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="text-gray-500 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Info box */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-xs text-blue-800">
            <div className="font-semibold mb-1">📸 {t?.snapshot || 'Snapshot'}</div>
            <div className="text-blue-700">
              {t?.completeSave || 'Complete save. Click to restore.'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className={`p-3 border rounded-md transition-colors ${restoring === snapshot.id
                ? 'border-blue-500 bg-blue-50 opacity-50'
                : snapshot.isEmpty
                  ? 'border-red-200 bg-red-50'
                  : 'border-blue-200 bg-blue-50/50 hover:bg-blue-100'
                }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRestore(snapshot)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold">{t?.snapshot || 'Snapshot'}</span>
                    {snapshot.isEmpty && (
                      <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded">
                        {t?.empty || 'Empty'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {format(new Date(snapshot.created_at), 'd MMM, HH:mm')}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDelete(snapshot, e)}
                  disabled={deleting === snapshot.id}
                  className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 ml-2"
                  title={t?.deleteSnapshot || 'Delete snapshot'}
                >
                  {deleting === snapshot.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRestore(snapshot)
                  }}
                  disabled={restoring === snapshot.id}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 transition-colors"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${restoring === snapshot.id ? 'animate-spin' : ''}`} />
                  {restoring === snapshot.id ? (t?.restoring || 'Restoring...') : (t?.restoreThisVersion || 'Restore this version')}
                </button>
              </div>
            </div>
          ))}

          {snapshots.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t?.noSnapshotsYet || 'No snapshots yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
