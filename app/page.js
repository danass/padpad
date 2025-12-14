import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">PadPad</h1>
        <div className="space-y-3">
          <Link 
            href="/drive" 
            className="block p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900">Go to Drive</h2>
            <p className="text-sm text-gray-500 mt-1">View and manage your documents</p>
          </Link>
        </div>
      </div>
    </main>
  )
}

