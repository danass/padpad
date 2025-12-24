import { sql } from '@vercel/postgres'

export async function POST() {
  try {
    const results = []
    
    // Add is_public column to documents table
    try {
      await sql.query(`
        ALTER TABLE documents 
        ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE
      `)
      results.push({ success: true, message: 'Added is_public column to documents' })
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        results.push({ success: true, skipped: true, message: 'is_public column already exists' })
      } else {
        results.push({ success: false, error: error.message })
      }
    }
    
    // Create index for is_public
    try {
      await sql.query(`
        CREATE INDEX IF NOT EXISTS idx_documents_is_public 
        ON documents(is_public)
      `)
      results.push({ success: true, message: 'Created index on is_public' })
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        results.push({ success: true, skipped: true, message: 'Index already exists' })
      } else {
        results.push({ success: false, error: error.message })
      }
    }
    
    return Response.json({ success: true, results })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}




