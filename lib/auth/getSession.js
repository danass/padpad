import { auth } from '@/auth'

export async function getSession() {
  return await auth()
}

export async function getUserId() {
  const session = await auth()
  // Use email as stable identifier (more reliable than token.sub which can change)
  return session?.user?.email || session?.user?.id || null
}





