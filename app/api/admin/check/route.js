import { isAdmin } from '@/lib/auth/isAdmin'

export async function GET() {
  try {
    const admin = await isAdmin()
    return Response.json({ isAdmin: admin })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return Response.json({ isAdmin: false })
  }
}



