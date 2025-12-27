import { isAdmin } from '@/lib/auth/isAdmin'

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



