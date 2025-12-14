'use client'

import { useEffect, useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Save, Edit, RotateCcw } from 'lucide-react'

export default function HistoryPanel({ documentId, onRestore, onClose }) {
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(null)
  
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
    return (history.snapshots || []).map(s => ({ ...s, type: 'snapshot' }))
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
  
  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-lg z-50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Historique</h2>
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
  
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-lg z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Historique</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Info box */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-xs text-blue-800">
            <div className="font-semibold mb-1">📸 Snapshot</div>
            <div className="text-blue-700">
              Sauvegarde complète. Cliquez pour restaurer.
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className={`p-3 border border-blue-200 bg-blue-50/50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer ${
                restoring === snapshot.id ? 'opacity-50' : ''
              }`}
              onClick={() => handleRestore(snapshot)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold">Snapshot</span>
                </div>
                <span className="text-xs text-gray-500">
                  {format(new Date(snapshot.created_at), 'd MMM, HH:mm')}
                </span>
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
                  {restoring === snapshot.id ? 'Restauration...' : 'Restaurer cette version'}
                </button>
              </div>
            </div>
          ))}
          
          {snapshots.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun snapshot pour le moment
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
