'use client'


import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'

export default function TestamentPreviewPage() {
  const sessionData = useSession()
  const session = sessionData?.data
  const status = sessionData?.status
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [birthDate, setBirthDate] = useState(null)
  const [documents, setDocuments] = useState([])
  const [age99Date, setAge99Date] = useState(null)
  const [testamentSlug, setTestamentSlug] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      loadData()
    }
  }, [status, router])

  const loadData = async () => {
    try {
      // Load testament slug/username
      const slugResponse = await fetch('/api/users/testament-slug')
      if (slugResponse.ok) {
        const slugData = await slugResponse.json()
        setTestamentSlug(slugData.testament_slug)
      }

      // Load birth date
      const birthResponse = await fetch('/api/users/birth-date')
      if (birthResponse.ok) {
        const birthData = await birthResponse.json()
        if (birthData.birth_date) {
          setBirthDate(birthData.birth_date)
          const birth = new Date(birthData.birth_date)
          const age99 = new Date(birth)
          age99.setFullYear(birth.getFullYear() + 99)
          setAge99Date(age99)
        }
      }

      // Load ALL documents recursively (including those in subfolders)
      // Use a recursive query to get all documents
      const docsResponse = await fetch('/api/documents/all')
      if (docsResponse.ok) {
        const docsData = await docsResponse.json()
        // Sort by updated_at (most recent first)
        const allDocs = (docsData.documents || []).sort((a, b) => {
          return new Date(b.updated_at) - new Date(a.updated_at)
        })
        setDocuments(allDocs)
      } else {
        // Fallback: try regular endpoint
        const fallbackResponse = await fetch('/api/documents')
        if (fallbackResponse.ok) {
          const docsData = await fallbackResponse.json()
          const allDocs = (docsData.documents || []).sort((a, b) => {
            return new Date(b.updated_at) - new Date(a.updated_at)
          })
          setDocuments(allDocs)
        }
      }
    } catch (error) {
      console.error('Error loading testament data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!birthDate) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Testament Preview</h1>
            <p className="text-gray-600 mb-6">
              Please set your birth date in Settings to preview your testament.
            </p>
            <Link
              href="/settings"
              className="inline-block px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Go to Settings
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center border-b border-gray-200 pb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Digital Testament</h1>
          <p className="text-lg text-gray-600 mb-2">
            This is how your testament will appear to the public
          </p>
          {age99Date && (
            <p className="text-sm text-gray-500 mb-4">
              Documents will become public on {format(age99Date, 'MMMM d, yyyy')} (your 99th birthday)
            </p>
          )}
          {testamentSlug && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-xs text-gray-600 mb-2">Public Testament URL:</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-sm font-mono bg-white px-3 py-1.5 rounded border border-gray-300 text-gray-900">
                  {typeof window !== 'undefined' ? `${window.location.origin}/public/testament/${testamentSlug}` : `/public/testament/${testamentSlug}`}
                </code>
                <button
                  onClick={async () => {
                    const url = typeof window !== 'undefined' ? `${window.location.origin}/public/testament/${testamentSlug}` : `/public/testament/${testamentSlug}`
                    try {
                      await navigator.clipboard.writeText(url)
                      alert('URL copied to clipboard!')
                    } catch (err) {
                      // Fallback for older browsers
                      const textArea = document.createElement('textarea')
                      textArea.value = url
                      textArea.style.position = 'fixed'
                      textArea.style.opacity = '0'
                      if (document.body) {
                        document.body.appendChild(textArea)
                        textArea.select()
                        document.execCommand('copy')
                        setTimeout(() => {
                          if (textArea.parentNode) {
                            document.body.removeChild(textArea)
                          }
                        }, 100)
                      }
                      alert('URL copied to clipboard!')
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-black text-white rounded hover:bg-gray-800 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Documents List */}
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No documents yet.</p>
            <p className="text-sm text-gray-500">
              Create documents to see them in your testament preview.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Documents ({documents.length})
              </h2>
              <p className="text-sm text-gray-600">
                All your documents will be made public on your 99th birthday
              </p>
            </div>

            <div className="space-y-4">
              {documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={doc.is_public ? `/public/doc/${doc.id}` : `/doc/${doc.id}`}
                  className="block border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {doc.title || 'Untitled'}
                      </h3>
                      {doc.content_text && (
                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                          {doc.content_text.substring(0, 200)}
                          {doc.content_text.length > 200 ? '...' : ''}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Created: {format(new Date(doc.created_at), 'MMM d, yyyy')}
                        </span>
                        <span>
                          Updated: {format(new Date(doc.updated_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            This is a preview. All your documents will automatically become public on your 99th birthday.
          </p>
        </div>
      </div>
    </div>
  )
}


