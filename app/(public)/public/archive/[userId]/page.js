import { sql } from '@vercel/postgres'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { cache } from 'react'
import ArchiveHeader from '@/components/archive/ArchiveHeader'

// Memoize data request
const getDocuments = cache(async (userId) => {
  if (!userId) return { documents: [], username: null, archiveId: null, ownerId: null, hasCustomUsername: false, error: 'No user ID' }

  try {
    let actualUserId = null
    let username = null
    let archiveId = null
    let hasCustomUsername = false

    // Search by testament_username or archive_id
    const userResult = await sql.query(
      'SELECT id, testament_username, archive_id FROM users WHERE testament_username = $1 OR archive_id = $1',
      [userId]
    )

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0]
      actualUserId = user.id
      archiveId = user.archive_id
      hasCustomUsername = !!user.testament_username
      username = user.testament_username || user.archive_id
    }

    if (!actualUserId) {
      return { documents: [], username: null, archiveId: null, ownerId: null, hasCustomUsername: false, error: 'User not found' }
    }

    // Also fetch content_text for fallback title
    const result = await sql.query(
      `SELECT d.id, d.title, d.content_text, d.created_at, d.updated_at, d.keywords
       FROM documents d
       WHERE d.user_id = $1 AND d.is_public = true
       ORDER BY d.updated_at DESC`,
      [actualUserId]
    )

    return {
      documents: result.rows.map(doc => {
        // Determine display title
        let displayTitle = null
        const hasRealTitle = doc.title && doc.title !== 'Untitled' && doc.title.trim() !== ''

        if (hasRealTitle) {
          displayTitle = doc.title
        } else if (doc.content_text && doc.content_text.trim()) {
          // Use first 50 chars of content as title
          const text = doc.content_text.trim()
          displayTitle = text.length > 50 ? text.substring(0, 50) + '...' : text
        }

        return {
          id: doc.id,
          title: displayTitle,
          updated_at: doc.updated_at,
          keywords: doc.keywords || []
        }
      }),
      username: username || userId,
      archiveId,
      ownerId: actualUserId,
      hasCustomUsername,
      error: null
    }
  } catch (error) {
    console.error('Error fetching documents:', error)
    return { documents: [], username: null, archiveId: null, ownerId: null, hasCustomUsername: false, error: 'Database error' }
  }
})

export async function generateMetadata({ params }) {
  const { userId } = await params
  const data = await getDocuments(userId)

  const title = data.username ? `@${data.username}` : `@${userId}`
  const description = data.documents?.length
    ? `View ${data.documents.length} public documents in the archive of ${title} on TextPad.`
    : `Public documents from ${title} on TextPad.`

  return {
    title: `${title} - Archive | Textpad`,
    description,
    alternates: {
      canonical: `/public/archive/${userId}`,
    },
  }
}

export default async function PublicArchivePage({ params }) {
  const { userId } = await params
  const { documents, username, archiveId, ownerId, hasCustomUsername, error } = await getDocuments(userId)

  if (error === 'User not found') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">User not found</h1>
          <p className="text-gray-600">No user with this identifier exists.</p>
          <a href="https://textpad.cloud" className="text-blue-600 hover:underline mt-4 inline-block">
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
        {/* Header with editable handle */}
        <ArchiveHeader
          username={username}
          archiveId={archiveId}
          documentCount={documents.length}
          hasCustomUsername={hasCustomUsername}
          ownerId={ownerId}
        />

        {/* Document list */}
        <div className="space-y-1">
          {documents.map((doc, index) => (
            <Link
              key={doc.id}
              href={`/public/doc/${doc.id}`}
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
                  {doc.keywords && doc.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 sm:mt-0 sm:ml-2">
                      {doc.keywords.slice(0, 2).map((k) => (
                        <span key={k} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">
                          {k}
                        </span>
                      ))}
                      {doc.keywords.length > 2 && (
                        <span className="text-[10px] text-gray-400">+{doc.keywords.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-4">
                  {format(new Date(doc.updated_at), 'd MMM yyyy', { locale: fr })}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <a href="https://www.textpad.cloud" className="text-xs text-gray-400 hover:text-gray-600">
            www.textpad.cloud
          </a>
        </div>
      </div>
    </div>
  )
}
