import { Suspense } from 'react'
import SignInClient from './SignInClient'

export const metadata = {
  title: 'Sign In | Textpad',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <SignInClient />
    </Suspense>
  )
}
