import { sql } from '@vercel/postgres'

export async function GET() {
    try {
        // Add IPFS columns to documents table
        await sql.query(`
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS ipfs_enabled BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS ipfs_cid TEXT
    `)

        // Create index for ipfs_cid
        await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_ipfs_cid ON documents(ipfs_cid)
    `)

        return Response.json({ success: true, message: 'Migration completed' })
    } catch (error) {
        console.error('Migration failed:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}
