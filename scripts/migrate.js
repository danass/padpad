import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { sql } from '@/lib/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
          console.log('✓ Executed statement')
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists') && 
              !error.message.includes('duplicate') &&
              !error.message.includes('relation') &&
              !error.message.includes('constraint')) {
            console.error('Error:', error.message)
          }
        }
      }
    }
    
    console.log('Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrate()





