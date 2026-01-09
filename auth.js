import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { sql } from '@vercel/postgres'

// Generate a random archive ID (8 chars, alphanumeric)
function generateArchiveId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Create or update user in DB on sign in with avatar
      try {
        const userId = user.email || user.id

        // Check if user is suspended - block login
        const suspendedCheck = await sql`SELECT suspended_at FROM users WHERE id = ${userId}`
        if (suspendedCheck.rowCount > 0 && suspendedCheck.rows[0].suspended_at) {
          return '/auth/suspended'
        }

        // Generate random archive_id (NOT based on email for privacy)
        const archiveId = generateArchiveId()

        // Use Google avatar or generate Dicebear avatar
        const googleAvatar = user.image || profile?.picture
        const dicebearSeed = Math.random().toString(36).substring(2, 12)
        const dicebearAvatar = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${dicebearSeed}`
        const avatarUrl = googleAvatar || dicebearAvatar

        // Insert user if not exists, don't overwrite existing archive_id or avatar
        await sql`
          INSERT INTO users (id, avatar_url, archive_id, updated_at)
          VALUES (${userId}, ${avatarUrl}, ${archiveId}, NOW())
          ON CONFLICT (id) DO UPDATE SET
            avatar_url = COALESCE(users.avatar_url, ${avatarUrl}),
            archive_id = COALESCE(users.archive_id, ${archiveId}),
            updated_at = NOW()
        `
      } catch (error) {
        console.error('Error creating user on signIn:', error)
        // Don't block sign in if DB fails
      }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = session.user.email || token.sub
        session.user.role = token.role || 'user'
        session.user.isAdmin = token.role === 'admin'
      }
      return session
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        // Initial sign in - fetch role from DB
        try {
          const userId = user.email || user.id
          const res = await sql`SELECT role FROM users WHERE id = ${userId}`
          if (res.rowCount > 0) {
            token.role = res.rows[0].role
          } else {
            token.role = 'user'
          }
        } catch (error) {
          console.error('Error fetching user role for JWT:', error)
          token.role = 'user'
        }
      }
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        ...(process.env.NODE_ENV === 'production' ? { domain: '.textpad.cloud' } : {})
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
})


