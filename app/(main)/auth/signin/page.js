import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { NO_INDEX_METADATA } from '@/lib/seo'

// Dynamic import for client components
const SignInClient = dynamic(() => import('./SignInClient'))

export const metadata = {
  ...NO_INDEX_METADATA,
  title: 'Sign In | Textpad',
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
