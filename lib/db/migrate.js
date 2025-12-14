import { readFileSync } from 'fs'
import { join } from 'path'
import { sql } from '../db.js'

async function migrate() {
  try {
    const migrationSQL = readFileSync(
      join(process.cwd(), 'lib/db/migrations.sql'),
      'utf8'
    )
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sql.query(statement)
          console.log('✓ Executed:', statement.substring(0, 50) + '...')
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists') && 
              !error.message.includes('duplicate')) {
            console.error('Error executing:', statement.substring(0, 50))
            console.error(error.message)
          }
        }
      }
    }
    
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrate()


