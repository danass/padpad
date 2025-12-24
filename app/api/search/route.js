import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'

export async function POST(request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { query: searchQuery, folder_id } = body
    
    if (!searchQuery || searchQuery.trim().length === 0) {
      return Response.json({ documents: [], folders: [] })
    }
    
    // Build recursive CTE to get all subfolders if folder_id is specified
    // For global search (no folder_id), search everywhere
    let docQuery
    const params = [searchQuery, userId, `%${searchQuery}%`]
    
    if (folder_id !== undefined && folder_id !== null) {
      // Search recursively in specified folder and all subfolders
      docQuery = `
        WITH RECURSIVE folder_tree AS (
          SELECT id FROM folders WHERE user_id = $2 AND id = $4
          UNION ALL
          SELECT f.id FROM folders f
          INNER JOIN folder_tree ft ON f.parent_id = ft.id
          WHERE f.user_id = $2
        )
        SELECT 
          d.id,
          d.title,
          d.folder_id,
          d.created_at,
          d.updated_at,
          d.content_text,
          GREATEST(
            ts_rank(to_tsvector('simple', COALESCE(d.title, '') || ' ' || COALESCE(d.content_text, '')), plainto_tsquery('simple', $1)),
            CASE WHEN LOWER(d.title) LIKE LOWER($3) THEN 0.5 ELSE 0 END
          ) as rank
        FROM documents d
        WHERE d.user_id = $2
          AND (d.folder_id IN (SELECT id FROM folder_tree) OR d.folder_id = $4)
          AND (
            to_tsvector('simple', COALESCE(d.title, '') || ' ' || COALESCE(d.content_text, '')) @@ plainto_tsquery('simple', $1)
            OR LOWER(d.title) LIKE LOWER($3)
          )
        ORDER BY rank DESC, d.updated_at DESC LIMIT 50
      `
      params.push(folder_id)
    } else {
      // Global search - search everywhere
      docQuery = `
        SELECT 
          d.id,
          d.title,
          d.folder_id,
          d.created_at,
          d.updated_at,
          d.content_text,
          GREATEST(
            ts_rank(to_tsvector('simple', COALESCE(d.title, '') || ' ' || COALESCE(d.content_text, '')), plainto_tsquery('simple', $1)),
            CASE WHEN LOWER(d.title) LIKE LOWER($3) THEN 0.5 ELSE 0 END
          ) as rank
        FROM documents d
        WHERE d.user_id = $2
          AND (
            to_tsvector('simple', COALESCE(d.title, '') || ' ' || COALESCE(d.content_text, '')) @@ plainto_tsquery('simple', $1)
            OR LOWER(d.title) LIKE LOWER($3)
          )
        ORDER BY rank DESC, d.updated_at DESC LIMIT 50
      `
    }
    
    const docResult = await sql.query(docQuery, params)
    
    // Also search folder names recursively
    let folderQuery
    const folderParams = [userId, `%${searchQuery}%`]
    
    if (folder_id !== undefined && folder_id !== null) {
      folderQuery = `
        WITH RECURSIVE folder_tree AS (
          SELECT id, name, parent_id FROM folders WHERE user_id = $1 AND id = $3
          UNION ALL
          SELECT f.id, f.name, f.parent_id FROM folders f
          INNER JOIN folder_tree ft ON f.parent_id = ft.id
          WHERE f.user_id = $1
        )
        SELECT * FROM folder_tree
        WHERE LOWER(name) LIKE LOWER($2)
        ORDER BY name ASC LIMIT 20
      `
      folderParams.push(folder_id)
    } else {
      // Global search - search all folders
      folderQuery = `
        SELECT * FROM folders
        WHERE user_id = $1 AND LOWER(name) LIKE LOWER($2)
        ORDER BY name ASC LIMIT 20
      `
    }
    
    const folderResult = await sql.query(folderQuery, folderParams)
    
    return Response.json({
      documents: docResult.rows,
      folders: folderResult.rows
    })
  } catch (error) {
    console.error('Error searching:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}






