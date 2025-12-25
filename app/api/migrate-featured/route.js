import { sql } from '@vercel/postgres'

// One-time migration to add featured columns
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

        return Response.json({ success: true, message: 'Migration completed' })
    } catch (error) {
        console.error('Migration error:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}
