import { isAdmin } from '@/lib/auth/isAdmin'

/**
 * @deprecated This endpoint can be removed. Admin status is now included
 * in the session object (session.user.isAdmin). Components should read from
 * the session instead of making API calls.
 */
export async function GET() {
  try {
    const { isCurator } = require('@/lib/auth/isCurator')
    const admin = await isAdmin()
    const curator = await isCurator()
    return Response.json({ isAdmin: admin, isCurator: curator })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return Response.json({ isAdmin: false })
  }
}




