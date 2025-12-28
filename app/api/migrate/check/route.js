import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    // Check if main tables exist
    const tablesToCheck = ['documents', 'folders', 'document_snapshots', 'document_events']
    const existingTables = []
    
    for (const table of tablesToCheck) {
      try {
        const result = await sql.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )`,
          [table]
        )
        if (result.rows[0].exists) {
          existingTables.push(table)
        }
      } catch (error) {
        // Table doesn't exist or error checking
        console.error(`Error checking table ${table}:`, error)
      }
    }
    
    // If all main tables exist, database is already set up
    const isSetup = existingTables.length === tablesToCheck.length
    
    return Response.json({ 
      isSetup,
      existingTables,
      needsMigration: !isSetup
    })
  } catch (error) {
    console.error('Error checking database setup:', error)
    // If we can't check, assume it needs migration
    return Response.json({ 
      isSetup: false,
      existingTables: [],
      needsMigration: true
    })
  }
}




