import { sql } from '@vercel/postgres'

// Define all expected columns per table
const EXPECTED_SCHEMA = {
  users: ['id', 'birth_date', 'testament_slug', 'testament_username', 'avatar_url', 'archive_id', 'ipfs_config', 'role', 'suspended_at', 'suspension_reason'],
  documents: ['id', 'title', 'folder_id', 'created_at', 'updated_at', 'current_snapshot_id', 'content_text', 'user_id', 'auto_public_date', 'is_public', 'is_full_width', 'is_featured', 'featured_at', 'is_disposable', 'expires_at', 'keywords'],
  folders: ['id', 'name', 'parent_id', 'created_at', 'updated_at', 'user_id'],
  document_snapshots: ['id', 'document_id', 'content_json', 'content_text', 'created_at'],
  document_events: ['id', 'document_id', 'type', 'payload', 'version', 'created_at']
}

export async function GET() {
  try {
    const missingTables = []
    const missingColumns = []
    let allTablesExist = true

    // Check each table and its columns
    for (const [tableName, expectedColumns] of Object.entries(EXPECTED_SCHEMA)) {
      // Check if table exists
      const tableCheck = await sql.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [tableName]
      )

      if (!tableCheck.rows[0].exists) {
        missingTables.push(tableName)
        allTablesExist = false
        continue
      }

      // Check which columns exist
      const columnsResult = await sql.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_schema = 'public' 
         AND table_name = $1`,
        [tableName]
      )

      const existingColumns = columnsResult.rows.map(r => r.column_name)

      for (const col of expectedColumns) {
        if (!existingColumns.includes(col)) {
          missingColumns.push({ table: tableName, column: col })
        }
      }
    }

    const isFullyMigrated = missingTables.length === 0 && missingColumns.length === 0

    return Response.json({
      isSetup: allTablesExist,
      isFullyMigrated,
      needsMigration: !isFullyMigrated,
      missingTables,
      missingColumns
    })
  } catch (error) {
    console.error('Error checking database setup:', error)
    return Response.json({
      isSetup: false,
      isFullyMigrated: false,
      needsMigration: true,
      error: error.message
    })
  }
}
