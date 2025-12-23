import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    const checks = {
      extension: false,
      tables: {},
      columns: {},
      indexes: {},
      constraints: {},
      functions: {},
      triggers: {}
    }
    
    // Check UUID extension
    try {
      const extResult = await sql.query(
        `SELECT EXISTS (
          SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'
        )`
      )
      checks.extension = extResult.rows[0].exists
    } catch (error) {
      console.error('Error checking extension:', error)
    }
    
    // Check tables
    const tablesToCheck = ['folders', 'documents', 'document_snapshots', 'document_events']
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
        checks.tables[table] = result.rows[0].exists
        
        // If table exists, check columns
        if (result.rows[0].exists) {
          const columnsResult = await sql.query(
            `SELECT column_name, data_type 
             FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = $1`,
            [table]
          )
          checks.columns[table] = columnsResult.rows.map(r => ({
            name: r.column_name,
            type: r.data_type
          }))
        }
      } catch (error) {
        console.error(`Error checking table ${table}:`, error)
        checks.tables[table] = false
      }
    }
    
    // Check indexes
    const indexesToCheck = [
      'idx_documents_folder_id',
      'idx_documents_updated_at',
      'idx_document_events_document_version',
      'idx_document_snapshots_document_created',
      'idx_folders_parent_id',
      'idx_documents_content_text_search',
      'idx_documents_user_id',
      'idx_folders_user_id',
      'idx_documents_auto_public_date',
      'idx_users_birth_date'
    ]
    for (const index of indexesToCheck) {
      try {
        const result = await sql.query(
          `SELECT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND indexname = $1
          )`,
          [index]
        )
        checks.indexes[index] = result.rows[0].exists
      } catch (error) {
        checks.indexes[index] = false
      }
    }
    
    // Check constraint fk_current_snapshot
    try {
      const result = await sql.query(
        `SELECT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'fk_current_snapshot'
        )`
      )
      checks.constraints.fk_current_snapshot = result.rows[0].exists
    } catch (error) {
      checks.constraints.fk_current_snapshot = false
    }
    
    // Check function update_updated_at_column
    try {
      const result = await sql.query(
        `SELECT EXISTS (
          SELECT 1 FROM pg_proc 
          WHERE proname = 'update_updated_at_column'
        )`
      )
      checks.functions.update_updated_at_column = result.rows[0].exists
    } catch (error) {
      checks.functions.update_updated_at_column = false
    }
    
    // Check triggers
    const triggersToCheck = [
      'update_documents_updated_at',
      'update_folders_updated_at'
    ]
    for (const trigger of triggersToCheck) {
      try {
        const result = await sql.query(
          `SELECT EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = $1
          )`,
          [trigger]
        )
        checks.triggers[trigger] = result.rows[0].exists
      } catch (error) {
        checks.triggers[trigger] = false
      }
    }
    
    // Determine if migration is needed
    const allTablesExist = tablesToCheck.every(t => checks.tables[t] === true)
    const allIndexesExist = indexesToCheck.every(i => checks.indexes[i] === true)
    const allTriggersExist = triggersToCheck.every(t => checks.triggers[t] === true)
    
    // Check required columns
    const requiredColumns = {
      documents: ['id', 'title', 'folder_id', 'created_at', 'updated_at', 'current_snapshot_id', 'content_text', 'user_id', 'auto_public_date'],
      folders: ['id', 'name', 'parent_id', 'created_at', 'updated_at', 'user_id'],
      document_snapshots: ['id', 'document_id', 'content_json', 'content_text', 'created_at'],
      document_events: ['id', 'document_id', 'type', 'payload', 'version', 'created_at'],
      users: ['id', 'birth_date', 'created_at', 'updated_at']
    }
    
    let allColumnsExist = true
    for (const [table, columns] of Object.entries(requiredColumns)) {
      if (!checks.columns[table]) {
        allColumnsExist = false
        break
      }
      const existingColumns = checks.columns[table].map(c => c.name)
      for (const col of columns) {
        if (!existingColumns.includes(col)) {
          allColumnsExist = false
          break
        }
      }
      if (!allColumnsExist) break
    }
    
    const needsMigration = !(
      checks.extension &&
      allTablesExist &&
      allIndexesExist &&
      allTriggersExist &&
      checks.constraints.fk_current_snapshot &&
      checks.functions.update_updated_at_column &&
      allColumnsExist
    )
    
    return Response.json({
      needsMigration,
      checks,
      summary: {
        extension: checks.extension,
        allTables: allTablesExist,
        allIndexes: allIndexesExist,
        allTriggers: allTriggersExist,
        constraint: checks.constraints.fk_current_snapshot,
        function: checks.functions.update_updated_at_column,
        allColumns: allColumnsExist
      }
    })
  } catch (error) {
    console.error('Error comparing schema:', error)
    return Response.json({ 
      needsMigration: true,
      error: error.message 
    })
  }
}

