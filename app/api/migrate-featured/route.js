import { sql } from '@vercel/postgres'

// One-time migration to add featured columns and archive_id
export async function GET() {
  try {
    // Add is_featured column
    await sql`
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false
    `

    // Add featured_at column
    await sql`
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS featured_at TIMESTAMP WITH TIME ZONE
    `

    // Add archive_id column to users
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS archive_id TEXT UNIQUE
    `

    // Generate archive_id for all existing users who don't have one
    // Use first 8 chars of MD5 hash of their id
    await sql`
      UPDATE users 
      SET archive_id = LEFT(MD5(id), 8)
      WHERE archive_id IS NULL
    `

    // Create index for archive_id
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_archive_id ON users(archive_id) WHERE archive_id IS NOT NULL
    `

    return Response.json({ success: true, message: 'Migration completed - featured columns and archive_id added' })
  } catch (error) {
    console.error('Migration error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
