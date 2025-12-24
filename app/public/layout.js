import '../globals.css'

export const metadata = {
  title: 'Textpad - Public',
  description: 'Public content on Textpad',
}

// Minimal layout for public pages - no auth, no session, no providers
export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}
