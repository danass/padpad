import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    // Add is_full_width column to documents table
    await sql`
      ALTER TABLE documents
      ADD COLUMN IF NOT EXISTS is_full_width BOOLEAN DEFAULT false
    `
    
    return Response.json({ 
      success: true, 
      message: 'Added is_full_width column to documents table'
    })
  } catch (error) {
    console.error('Migration error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}


