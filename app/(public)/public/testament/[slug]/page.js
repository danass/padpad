import { sql } from '@vercel/postgres'
import { cache } from 'react'
import TestamentClient from './client'

// Memoize data request
const getTestamentData = cache(async (slug) => {
  try {
    const userResult = await sql.query(
      'SELECT id, birth_date, testament_username FROM users WHERE testament_username = $1 OR id::text = $1',
      [slug]
    )

    if (userResult.rows.length === 0) return { error: 'Not found' }
    const user = userResult.rows[0]

    // Calculate age 99 date
    let age99Date = null
    if (user.birth_date) {
      age99Date = new Date(user.birth_date)
      age99Date.setFullYear(age99Date.getFullYear() + 99)
    }

    // Check if testament is ready to be public
    const today = new Date()
    const isPublic = age99Date && today >= age99Date

    // Fetch documents
    const docResult = await sql.query(
      'SELECT id, title, content_text, created_at, updated_at FROM documents WHERE user_id = $1 AND is_public = true ORDER BY created_at DESC',
      [user.id]
    )

    return {
      documents: docResult.rows,
      username: user.testament_username || 'Anonymous',
      age99Date: age99Date?.toISOString(),
      isPublic
    }
  } catch (error) {
    console.error('Error fetching testament:', error)
    return { error: 'Server error' }
  }
})

export async function generateMetadata({ params }) {
  const { slug } = await params
  const data = await getTestamentData(slug)

  const title = data.username ? `Digital Testament of @${data.username}` : 'Digital Testament'
  const description = data.documents?.length
    ? `Read the digital legacy and ${data.documents.length} public documents of ${data.username}.`
    : `Digital testament and legacy on TextPad.`

  return {
    title: `${title} | TextPad`,
    description,
    alternates: {
      canonical: `/public/testament/${slug}`,
    },
  }
}

export default async function PublicTestamentPage({ params }) {
  const { slug } = await params
  const data = await getTestamentData(slug)

  if (data.error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Testament Not Found</h1>
            <p className="text-gray-600">The requested digital testament could not be found or is not yet public.</p>
          </div>
        </div>
      </div>
    )
  }

  return <TestamentClient initialData={data} />
}
