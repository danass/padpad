import { sql } from '@vercel/postgres'

export async function POST() {
  try {
    const results = []
    
    // Create admins table
    const migrations = [
      `CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      `CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email)`,
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




