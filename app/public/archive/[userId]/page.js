'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// Use absolute URL to avoid CORS issues with subdomains
const API_BASE = typeof window !== 'undefined'
  ? `${window.location.protocol}//www.textpad.cloud`
  : 'https://www.textpad.cloud'

export default function PublicArchivePage() {
  const params = useParams()
  const userId = params.userId

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [documents, setDocuments] = useState([])
  const [username, setUsername] = useState(null)

  useEffect(() => {
    async function loadDocuments() {
      if (!userId) return

      setLoading(true)
      setError(null)

      try {
        // Use absolute URL to main domain
        const response = await fetch(`${API_BASE}/api/public/users/${userId}/documents`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('User not found')
          } else {
            setError('Failed to load documents')
          }
          setLoading(false)
          return
        }

        const data = await response.json()
        setDocuments(data.documents || [])
        setUsername(data.username)
        setLoading(false)
      } catch (err) {
        console.error('Error loading documents:', err)
        setError('An error occurred')
        setLoading(false)
      }
    }

    loadDocuments()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
          <a href="https://www.textpad.cloud" className="text-blue-600 hover:underline mt-4 inline-block">
            Go to Textpad
          </a>
        </div>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">No public documents</h1>
          <p className="text-gray-600">This user has no public documents yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            {username ? `@${username}` : 'Archive'}
          </h1>
          <p className="text-sm text-gray-500">
            {documents.length} document{documents.length > 1 ? 's' : ''} public{documents.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Document list */}
        <div className="space-y-1">
          {documents.map((doc, index) => (
            <a
              key={doc.id}
              href={`https://www.textpad.cloud/public/doc/${doc.id}`}
              className="block group"
            >
              <div className="flex items-baseline justify-between py-3 px-4 -mx-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-baseline gap-4 min-w-0">
                  <span className="text-xs text-gray-400 font-mono w-6 flex-shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-gray-900 group-hover:text-black transition-colors truncate">
                    {doc.title || <span className="italic text-gray-400">Sans titre</span>}
                  </span>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-4">
                  {format(new Date(doc.updated_at), 'd MMM yyyy', { locale: fr })}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <a href="https://www.textpad.cloud" className="text-xs text-gray-400 hover:text-gray-600">
            textpad.cloud
          </a>
        </div>
      </div>
    </div>
  )
}
