import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'

export async function POST(request, { params }) {
    try {
        const { id } = await params
        const userId = await getUserId()

        console.log(`[CLAIM PAD] Document: ${id}, User: ${userId}`)

        if (!userId) {
            console.log(`[CLAIM PAD] 401 - No User session`)
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if document exists and is disposable
        const docResult = await sql.query(
            'SELECT * FROM documents WHERE id = $1',
            [id]
        )

        if (docResult.rows.length === 0) {
            return Response.json({ error: 'Document not found' }, { status: 404 })
        }

        const doc = docResult.rows[0]

        if (!doc.is_disposable) {
            // Idempotency: If already claimed by the same user, return success
            if (doc.user_id === userId) {
                return Response.json({
                    document: doc,
                    message: 'Document already claimed'
                })
            }
            return Response.json({ error: 'Document is not disposable' }, { status: 400 })
        }

        // Update document: claim it
        await sql.query(
            `UPDATE documents 
       SET user_id = $1, 
           is_disposable = false, 
           expires_at = NULL, 
           is_public = true,
           updated_at = NOW()
       WHERE id = $2`,
            [userId, id]
        )

        // Fetch updated document
        const updatedDoc = await sql.query(
            'SELECT * FROM documents WHERE id = $1',
            [id]
        )

        return Response.json({
            document: updatedDoc.rows[0],
            message: 'Document claimed successfully'
        })
    } catch (error) {
        console.error('Error claiming document:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}
