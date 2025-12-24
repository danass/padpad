import { sql } from '@vercel/postgres'

export async function POST() {
  try {
    const results = []
    
    // Execute only user_id migrations
    const migrations = [
      `ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id TEXT`,
      `ALTER TABLE folders ADD COLUMN IF NOT EXISTS user_id TEXT`,
      `CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id)`,
    ]
    
    for (const migration of migrations) {
      try {
        await sql.query(migration)
        results.push({ success: true, statement: migration.substring(0, 80) })
      } catch (error) {
        // Ignore "already exists" errors
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate')) {
          results.push({ success: true, skipped: true, message: error.message.substring(0, 100) })
        } else {
          results.push({ success: false, error: error.message.substring(0, 200) })
        }
      }
    }
    
    return Response.json({ success: true, results })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}




