import { sql } from '@vercel/postgres'

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return Response.json({ error: 'Missing id' })

    try {
        let docResult = await sql.query('SELECT id, is_public, is_disposable, expires_at, created_at FROM documents WHERE id = $1', [id])

        if (docResult.rowCount === 0) {
            docResult = await sql.query('SELECT id, is_public, is_disposable, expires_at, created_at FROM documents WHERE id::text LIKE $1', [`${id}%`])
        }

        return Response.json({
            count: docResult.rowCount,
            documents: docResult.rows,
            now: new Date().toISOString()
        })
    } catch (e) {
        return Response.json({ error: e.message })
    }
}
