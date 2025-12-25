import { sql } from '@vercel/postgres'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

export async function generateMetadata({ params }) {
  const { userId } = await params
  return {
    title: `@${userId} - Archive | Textpad`,
    description: `Public documents from ${userId}`,
  }
}

async function getDocuments(userId) {
  if (!userId) return { documents: [], username: null, error: 'No user ID' }

  try {
    let actualUserId = null
    let username = null

    // First try testament_username
    const usernameResult = await sql.query(
      'SELECT id, testament_username FROM users WHERE testament_username = $1',
      [userId]
    )
    if (usernameResult.rows.length > 0) {
      actualUserId = usernameResult.rows[0].id
      username = usernameResult.rows[0].testament_username
    }

    // If not found, try matching by short UUID hash (first 8 chars without dashes)
    if (!actualUserId && userId.length === 8 && /^[0-9a-f]+$/i.test(userId)) {
      const hashResult = await sql.query(
        "SELECT id, testament_username FROM users WHERE REPLACE(id::text, '-', '') LIKE $1",
        [`${userId}%`]
      )
      if (hashResult.rows.length > 0) {
        actualUserId = hashResult.rows[0].id
        username = hashResult.rows[0].testament_username || userId
      }
    }

    // Also try full UUID if it looks like one
    if (!actualUserId && userId.includes('-')) {
      const uuidResult = await sql.query(
        'SELECT id, testament_username FROM users WHERE id = $1',
        [userId]
      )
      if (uuidResult.rows.length > 0) {
        actualUserId = uuidResult.rows[0].id
        username = uuidResult.rows[0].testament_username || userId.replace(/-/g, '').substring(0, 8)
      }
    }

    if (!actualUserId) {
      return { documents: [], username: null, error: 'User not found' }
    }

    const result = await sql.query(
      `SELECT d.id, d.title, d.created_at, d.updated_at
       FROM documents d
       WHERE d.user_id = $1 AND d.is_public = true
       ORDER BY d.updated_at DESC`,
      [actualUserId]
    )

    return {
      documents: result.rows.map(doc => ({
        ...doc,
        title: (doc.title === 'Untitled' || !doc.title) ? '' : doc.title
      })),
      username: username || userId,
      error: null
    }
  } catch (error) {
    console.error('Error fetching documents:', error)
    return { documents: [], username: null, error: 'Database error' }
  }
}

export default async function PublicArchivePage({ params }) {
  const { userId } = await params
  const { documents, username, error } = await getDocuments(userId)

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
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            @{username}
          </h1>
          <p className="text-sm text-gray-500">
            {documents.length} document{documents.length > 1 ? 's' : ''} public{documents.length > 1 ? 's' : ''}
          </p>
        </div>

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
          <a href="https://textpad.cloud" className="text-xs text-gray-400 hover:text-gray-600">
            textpad.cloud
          </a>
        </div>
      </div>
    </div>
  )
}
