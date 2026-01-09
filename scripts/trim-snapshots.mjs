// One-time script to trim snapshots: keep first + last 9 (max 10)
import { sql } from '@vercel/postgres'

async function trimSnapshots() {
    console.log('Starting snapshot cleanup...')

    // Get all documents with more than 10 snapshots
    const docsResult = await sql`
    SELECT document_id, COUNT(*) as count 
    FROM document_snapshots 
    GROUP BY document_id 
    HAVING COUNT(*) > 10
  `

    console.log(`Found ${docsResult.rows.length} documents with >10 snapshots`)

    let totalDeleted = 0

    for (const doc of docsResult.rows) {
        // Get all snapshots for this document ordered by creation date
        const snapshotsResult = await sql.query(
            `SELECT id, created_at FROM document_snapshots 
       WHERE document_id = $1 
       ORDER BY created_at ASC`,
            [doc.document_id]
        )

        const snapshots = snapshotsResult.rows
        const count = snapshots.length

        if (count <= 10) continue

        // Keep: first (index 0) + last 9 (indices count-9 to count-1)
        // Delete: indices 1 to count-10
        const toDelete = snapshots.slice(1, count - 9).map(s => s.id)

        if (toDelete.length > 0) {
            const deleteResult = await sql.query(
                `DELETE FROM document_snapshots WHERE id = ANY($1::uuid[])`,
                [toDelete]
            )
            totalDeleted += deleteResult.rowCount
            console.log(`Document ${doc.document_id}: deleted ${deleteResult.rowCount} snapshots (had ${count})`)
        }
    }

    console.log(`\nDone! Deleted ${totalDeleted} snapshots total.`)
}

trimSnapshots().catch(console.error)
