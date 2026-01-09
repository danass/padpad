import { sql } from '@vercel/postgres'
import { isAdmin } from '@/lib/auth/isAdmin'
import { sendSuspensionEmail } from '@/lib/email/sendEmail'
import { generateDownloadToken } from '@/lib/auth/downloadToken'

export async function POST(request, { params }) {
    try {
        // Check if user is admin
        const admin = await isAdmin()
        if (!admin) {
            return Response.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { email } = await params
        const body = await request.json()
        const { reason } = body

        // Check if user exists
        const userResult = await sql.query(
            'SELECT id, suspended_at FROM users WHERE id = $1',
            [email]
        )

        if (userResult.rows.length === 0) {
            return Response.json({ error: 'User not found' }, { status: 404 })
        }

        if (userResult.rows[0].suspended_at) {
            return Response.json({ error: 'User is already suspended' }, { status: 400 })
        }

        // Suspend the user
        await sql.query(
            `UPDATE users SET suspended_at = NOW(), suspension_reason = $1 WHERE id = $2`,
            [reason || 'Policy violation', email]
        )

        // Unpublish all their public documents
        const unpublishResult = await sql.query(
            `UPDATE documents SET is_public = false WHERE user_id = $1 AND is_public = true`,
            [email]
        )

        // Generate secure download token
        const downloadToken = generateDownloadToken(email)

        // Send suspension email with download link
        const emailResult = await sendSuspensionEmail(email, reason, downloadToken)

        return Response.json({
            success: true,
            email,
            documentsUnpublished: unpublishResult.rowCount,
            emailSent: emailResult.success,
            emailError: emailResult.error
        })
    } catch (error) {
        console.error('Error suspending user:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}

// Unsuspend endpoint
export async function DELETE(request, { params }) {
    try {
        const admin = await isAdmin()
        if (!admin) {
            return Response.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { email } = await params

        await sql.query(
            `UPDATE users SET suspended_at = NULL, suspension_reason = NULL WHERE id = $1`,
            [email]
        )

        return Response.json({ success: true, email })
    } catch (error) {
        console.error('Error unsuspending user:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}
