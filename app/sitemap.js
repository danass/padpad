import { sql } from '@vercel/postgres'

export default async function sitemap() {
  const baseUrl = 'https://www.textpad.cloud'

  // 1. Fetch public documents (non-disposable ones are the main blog posts)
  // We exclude disposable pads as they are temporary
  const docsResult = await sql.query(
    'SELECT id, updated_at FROM documents WHERE is_public = true AND is_disposable = false ORDER BY updated_at DESC'
  )

  // 2. Fetch user archives (users who have articles)
  const usersResult = await sql.query(
    'SELECT testament_username, archive_id, updated_at FROM users WHERE testament_username IS NOT NULL OR archive_id IS NOT NULL'
  )

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/online-text-editor`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/features/decentralized-storage`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features/digital-testament`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features/images-and-drawings`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features/public-blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features/rich-media`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features/shareable-links`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features/tabs-and-drive`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features/version-history`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/featured`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/credits`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  const documentRoutes = docsResult.rows.map((doc) => ({
    url: `${baseUrl}/public/doc/${doc.id}`,
    lastModified: doc.updated_at,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const archiveRoutes = usersResult.rows.map((user) => ({
    url: `${baseUrl}/public/archive/${user.testament_username || user.archive_id}`,
    lastModified: user.updated_at || new Date(),
    changeFrequency: 'daily',
    priority: 0.6,
  }))

  return [...staticRoutes, ...documentRoutes, ...archiveRoutes]
}


