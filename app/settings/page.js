'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'

function TestamentUrlDisplay() {
  const [testamentSlug, setTestamentSlug] = useState(null)
  const [testamentUsername, setTestamentUsername] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      const [slugResponse, usernameResponse] = await Promise.all([
        fetch('/api/users/testament-slug'),
        fetch('/api/users/testament-username')
      ])
      
      if (slugResponse.ok) {
        const slugData = await slugResponse.json()
        setTestamentSlug(slugData.testament_slug)
      }
      
      if (usernameResponse.ok) {
        const usernameData = await usernameResponse.json()
        setTestamentUsername(usernameData.testament_username)
      }
    } catch (error) {
      console.error('Error loading testament data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return <div className="text-sm text-gray-500">Loading...</div>
  }
  
  const identifier = testamentUsername || testamentSlug
  if (!identifier) {
    return null
  }
  
  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/public/testament/${identifier}`
    : `/public/testament/${identifier}`
  
  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
      <p className="text-xs text-gray-600 mb-2">Public Testament URL:</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-sm font-mono bg-white px-3 py-1.5 rounded border border-gray-300 text-gray-900 break-all">
          {publicUrl}
        </code>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(publicUrl)
              alert('URL copied to clipboard!')
            } catch (err) {
              // Fallback for older browsers
              const textArea = document.createElement('textarea')
              textArea.value = publicUrl
              document.body.appendChild(textArea)
              textArea.select()
              document.execCommand('copy')
              document.body.removeChild(textArea)
              alert('URL copied to clipboard!')
            }
          }}
          className="px-3 py-1.5 text-xs bg-black text-white rounded hover:bg-gray-800 transition-colors whitespace-nowrap"
        >
          Copy
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        This URL will be accessible once your documents become public on your 99th birthday.
      </p>
    </div>
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  const [birthDate, setBirthDate] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [testamentUsername, setTestamentUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [savingUsername, setSavingUsername] = useState(false)
  
  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    loadData()
  }, [session, router])
  
  const loadData = async () => {
    try {
      const [birthResponse, avatarResponse, usernameResponse] = await Promise.all([
        fetch('/api/users/birth-date'),
        fetch('/api/users/avatar'),
        fetch('/api/users/testament-username')
      ])
      
      if (birthResponse.ok) {
        const birthData = await birthResponse.json()
        if (birthData.birth_date) {
          // Format date for input (YYYY-MM-DD)
          const date = new Date(birthData.birth_date)
          setBirthDate(date.toISOString().split('T')[0])
        }
      }
      
      if (avatarResponse.ok) {
        const avatarData = await avatarResponse.json()
        setAvatarUrl(avatarData.avatar_url || '')
      }
      
      if (usernameResponse.ok) {
        const usernameData = await usernameResponse.json()
        setTestamentUsername(usernameData.testament_username || '')
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSaveAvatar = async () => {
    setSavingAvatar(true)
    try {
      const response = await fetch('/api/users/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: avatarUrl || null })
      })
      
      if (response.ok) {
        showToast('Avatar saved successfully', 'success')
        // Reload page to update avatar in header
        window.location.reload()
      } else {
        const data = await response.json()
        showToast(data.error || 'Failed to save avatar', 'error')
      }
    } catch (error) {
      console.error('Error saving avatar:', error)
      showToast('Failed to save avatar', 'error')
    } finally {
      setSavingAvatar(false)
    }
  }
  
  const handleSaveUsername = async () => {
    setSavingUsername(true)
    try {
      const response = await fetch('/api/users/testament-username', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: testamentUsername || null })
      })
      
      if (response.ok) {
        showToast('Username saved successfully', 'success')
        // Reload to update URL display
        loadData()
      } else {
        const data = await response.json()
        showToast(data.error || 'Failed to save username', 'error')
      }
    } catch (error) {
      console.error('Error saving username:', error)
      showToast('Failed to save username', 'error')
    } finally {
      setSavingUsername(false)
    }
  }
  
  const handleSave = async () => {
    if (!birthDate) {
      showToast('Please enter your birth date', 'error')
      return
    }
    
    setSaving(true)
    try {
      const response = await fetch('/api/users/birth-date', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birth_date: birthDate })
      })
      
      if (response.ok) {
        showToast('Birth date saved successfully', 'success')
        
        // Calculate and show 99th birthday
        const birth = new Date(birthDate)
        const age99 = new Date(birth)
        age99.setFullYear(birth.getFullYear() + 99)
        showToast(`Your documents will become public on ${age99.toLocaleDateString()} (your 99th birthday)`, 'success')
      } else {
        const data = await response.json()
        showToast(data.error || 'Failed to save birth date', 'error')
      }
    } catch (error) {
      console.error('Error saving birth date:', error)
      showToast('Failed to save birth date', 'error')
    } finally {
      setSaving(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account settings</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Settings</h2>
          <p className="text-sm text-gray-600 mb-6">
            Customize your profile avatar. Generate a random avatar or enter a custom URL.
          </p>
          
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar Preview
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      onError={(e) => {
                        const defaultUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(session?.user?.email || session?.user?.name || 'user')}`
                        e.target.src = defaultUrl
                        setAvatarUrl(defaultUrl)
                      }}
                    />
                  ) : (
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(session?.user?.email || session?.user?.name || 'user')}`}
                      alt="Default Avatar" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // Generate random seed
                        const randomSeed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
                        const generatedUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`
                        setAvatarUrl(generatedUrl)
                      }}
                      className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium transition-colors"
                    >
                      Generate Random Avatar
                    </button>
                    <button
                      onClick={() => {
                        // Use email-based avatar
                        const emailSeed = session?.user?.email || session?.user?.name || 'user'
                        const generatedUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emailSeed)}`
                        setAvatarUrl(generatedUrl)
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 text-sm font-medium transition-colors"
                    >
                      Use Email Avatar
                    </button>
                    <button
                      onClick={() => {
                        setAvatarUrl('')
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div>
                    <label htmlFor="avatar-url" className="block text-xs font-medium text-gray-700 mb-1">
                      Or enter custom URL
                    </label>
                    <input
                      type="url"
                      id="avatar-url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSaveAvatar}
              disabled={savingAvatar}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {savingAvatar ? 'Saving...' : 'Save Avatar'}
            </button>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Testament Settings</h2>
          <p className="text-sm text-gray-600 mb-6">
            Set your birth date to enable automatic publication of all your documents when you turn 99 years old.
            All your documents will automatically become public on your 99th birthday, creating your digital testament.
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="birth-date" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                id="birth-date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
            
            {birthDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-900">
                  <strong>Your 99th birthday:</strong>{' '}
                  {(() => {
                    const birth = new Date(birthDate)
                    const age99 = new Date(birth)
                    age99.setFullYear(birth.getFullYear() + 99)
                    return age99.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  })()}
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  Documents with auto-publication enabled will become public on this date.
                </p>
              </div>
            )}
            
            <button
              onClick={handleSave}
              disabled={saving || !birthDate}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {saving ? 'Saving...' : 'Save Birth Date'}
            </button>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Testament URL</h2>
          <p className="text-sm text-gray-600 mb-6">
            Choose a custom username for your testament URL. Leave empty to use the default generated URL.
          </p>
          
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="testament-username" className="block text-sm font-medium text-gray-700 mb-2">
                Testament Username
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">textpad/public/testament/</span>
                    <input
                      type="text"
                      id="testament-username"
                      value={testamentUsername}
                      onChange={(e) => setTestamentUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="your-username"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Only lowercase letters, numbers, hyphens, and underscores. 3-30 characters.
                  </p>
                </div>
                <button
                  onClick={handleSaveUsername}
                  disabled={savingUsername}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  {savingUsername ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
          
          <TestamentUrlDisplay />
        </div>
        
        <div className="bg-white border border-gray-200 rounded-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Testament Preview</h2>
          <p className="text-sm text-gray-600 mb-4">
            Preview how your testament will appear to the public when documents become available.
          </p>
          <Link
            href="/testament/preview"
            className="inline-block px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            View Testament Preview
          </Link>
        </div>
      </div>
    </div>
  )
}


