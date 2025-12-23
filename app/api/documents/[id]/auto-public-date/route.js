import { sql } from '@vercel/postgres'
import { getUserId } from '@/lib/auth/getSession'
import { isAdmin } from '@/lib/auth/isAdmin'

export async function GET(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    
    const result = await sql.query(
      'SELECT auto_public_date FROM documents WHERE id = $1 AND user_id = $2',
      [id, userId]
    )
    
    if (result.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    return Response.json({ auto_public_date: result.rows[0].auto_public_date })
  } catch (error) {
    console.error('Error fetching auto public date:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const body = await request.json()
    const { auto_public_date } = body
    
    // Verify document exists and belongs to user
    let docResult = await sql.query(
      'SELECT id, user_id FROM documents WHERE id = $1',
      [id]
    )
    
    if (docResult.rows.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    
    const document = docResult.rows[0]
    
    if (!document.user_id) {
      await sql.query(
        'UPDATE documents SET user_id = $1 WHERE id = $2',
        [userId, id]
      )
    } else if (document.user_id !== userId) {
      const admin = await isAdmin()
      if (!admin) {
        return Response.json({ error: 'Document not found' }, { status: 404 })
      }
    }
    
    // If auto_public_date is provided, validate it
    let finalDate = null
    if (auto_public_date) {
      // Get user's birth date
      const userResult = await sql.query(
        'SELECT birth_date FROM users WHERE id = $1',
        [userId]
      )
      
      if (userResult.rows.length === 0 || !userResult.rows[0].birth_date) {
        return Response.json({ 
          error: 'Please set your birth date first in settings' 
        }, { status: 400 })
      }
      
      const birthDate = new Date(userResult.rows[0].birth_date)
      const targetDate = new Date(auto_public_date)
      
      // Calculate age at target date
      const age = targetDate.getFullYear() - birthDate.getFullYear()
      const monthDiff = targetDate.getMonth() - birthDate.getMonth()
      const dayDiff = targetDate.getDate() - birthDate.getDate()
      
      let actualAge = age
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        actualAge--
      }
      
      // Validate that date is at least 99 years after birth
      if (actualAge < 99) {
        return Response.json({ 
          error: 'Auto-publication date must be at least 99 years after your birth date' 
        }, { status: 400 })
      }
      
      finalDate = auto_public_date
    }
    
    // Update auto_public_date
    const result = await sql.query(
      'UPDATE documents SET auto_public_date = $1 WHERE id = $2 RETURNING id, auto_public_date',
      [finalDate, id]
    )
    
    return Response.json({ 
      document: {
        id: result.rows[0].id,
        auto_public_date: result.rows[0].auto_public_date
      }
    })
  } catch (error) {
    console.error('Error updating auto public date:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

