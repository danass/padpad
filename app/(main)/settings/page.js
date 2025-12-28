'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function SettingsPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const { showToast } = useToast()
  const { t } = useLanguage()

  // Data states
  const [birthDate, setBirthDate] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [testamentUsername, setTestamentUsername] = useState('')

  // Original values for comparison
  const [originalBirthDate, setOriginalBirthDate] = useState('')
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState('')
  const [originalUsername, setOriginalUsername] = useState('')

  // UI states
  const [loading, setLoading] = useState(true)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [savingUsername, setSavingUsername] = useState(false)
  const [savingBirthDate, setSavingBirthDate] = useState(false)

  // IPFS states - multi-provider
  const [ipfsProviders, setIpfsProviders] = useState([])
  const [showAddProviderModal, setShowAddProviderModal] = useState(false)
  const [newProviderType, setNewProviderType] = useState('filebase')
  const [newProviderName, setNewProviderName] = useState('')
  const [newAccessKey, setNewAccessKey] = useState('')
  const [newSecretKey, setNewSecretKey] = useState('')
  const [newBucket, setNewBucket] = useState('')
  const [newRootCid, setNewRootCid] = useState('')
  const [newGateway, setNewGateway] = useState('w3s.link')
  const [testingIpfs, setTestingIpfs] = useState(false)
  const [savingIpfs, setSavingIpfs] = useState(false)
  const [ipfsTestResult, setIpfsTestResult] = useState(null)

  // Track if values have changed
  const avatarChanged = avatarUrl !== originalAvatarUrl
  const usernameChanged = testamentUsername !== originalUsername
  const birthDateChanged = birthDate !== originalBirthDate

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || !session) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    loadData()
  }, [session, status, router])

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
          const date = new Date(birthData.birth_date)
          const formatted = date.toISOString().split('T')[0]
          setBirthDate(formatted)
          setOriginalBirthDate(formatted)
        }
      }

      if (avatarResponse.ok) {
        const avatarData = await avatarResponse.json()
        setAvatarUrl(avatarData.avatar_url || '')
        setOriginalAvatarUrl(avatarData.avatar_url || '')
      }

      if (usernameResponse.ok) {
        const usernameData = await usernameResponse.json()
        setTestamentUsername(usernameData.testament_username || '')
        setOriginalUsername(usernameData.testament_username || '')
      }

      // Load IPFS providers
      const ipfsResponse = await fetch('/api/ipfs/config')
      if (ipfsResponse.ok) {
        const ipfsData = await ipfsResponse.json()
        setIpfsProviders(ipfsData.providers || [])
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
        setOriginalAvatarUrl(avatarUrl)
        showToast(t?.avatarSaved || 'Avatar saved', 'success')
        setTimeout(() => window.location.reload(), 500)
      } else {
        const data = await response.json()
        showToast(data.error || 'Failed to save avatar', 'error')
      }
    } catch (error) {
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
        setOriginalUsername(testamentUsername)
        showToast(t?.usernameSaved || 'Username saved', 'success')
      } else {
        const data = await response.json()
        showToast(data.error || 'Failed to save username', 'error')
      }
    } catch (error) {
      showToast('Failed to save username', 'error')
    } finally {
      setSavingUsername(false)
    }
  }

  const handleSaveBirthDate = async () => {
    setSavingBirthDate(true)
    try {
      const response = await fetch('/api/users/birth-date', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birth_date: birthDate || null })
      })

      if (response.ok) {
        setOriginalBirthDate(birthDate)
        if (birthDate) {
          const birth = new Date(birthDate)
          const age99 = new Date(birth)
          age99.setFullYear(birth.getFullYear() + 99)
          showToast(`Documents will become public on ${age99.toLocaleDateString()}`, 'success')
        } else {
          showToast('Digital Legacy disabled', 'success')
        }
      } else {
        showToast('Failed to save birth date', 'error')
      }
    } catch (error) {
      showToast('Failed to save birth date', 'error')
    } finally {
      setSavingBirthDate(false)
    }
  }

  const handleClearBirthDate = () => {
    setBirthDate('')
  }

  const handleTestIpfs = async () => {
    setTestingIpfs(true)
    setIpfsTestResult(null)
    try {
      const response = await fetch('/api/ipfs/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: newProviderType,
          accessKey: newAccessKey,
          secretKey: newSecretKey,
          bucket: newBucket,
        }),
      })
      const data = await response.json()
      setIpfsTestResult(data)
    } catch (error) {
      setIpfsTestResult({ success: false, error: error.message })
    } finally {
      setTestingIpfs(false)
    }
  }

  const handleAddProvider = async () => {
    setSavingIpfs(true)
    try {
      const body = {
        name: newProviderName || (newProviderType === 'filebase' ? `Filebase (${newBucket})` : `Storacha (${newRootCid.slice(0, 12)}...)`),
        provider: newProviderType,
      }
      if (newProviderType === 'filebase') {
        body.accessKey = newAccessKey
        body.secretKey = newSecretKey
        body.bucket = newBucket
      } else {
        body.rootCid = newRootCid
        body.gateway = newGateway
      }

      const response = await fetch('/api/ipfs/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        showToast('Storage added', 'success')
        setShowAddProviderModal(false)
        // Reset form
        setNewProviderName('')
        setNewAccessKey('')
        setNewSecretKey('')
        setNewBucket('')
        setNewRootCid('')
        setIpfsTestResult(null)
        // Reload providers
        const ipfsResponse = await fetch('/api/ipfs/config')
        if (ipfsResponse.ok) {
          const data = await ipfsResponse.json()
          setIpfsProviders(data.providers || [])
        }
      } else {
        const data = await response.json()
        showToast(data.error || 'Failed to add', 'error')
      }
    } catch (error) {
      showToast('Failed to add storage', 'error')
    } finally {
      setSavingIpfs(false)
    }
  }

  const handleDeleteProvider = async (providerId) => {
    if (!confirm('Remove this storage?')) return
    try {
      const response = await fetch(`/api/ipfs/config?id=${providerId}`, { method: 'DELETE' })
      if (response.ok) {
        setIpfsProviders(ipfsProviders.filter(p => p.id !== providerId))
        showToast('Storage removed', 'success')
      }
    } catch (error) {
      showToast('Failed to remove', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const subdomainUrl = testamentUsername ? `https://${testamentUsername}.textpad.cloud` : null

  return (
    <div className="min-h-screen bg-white font-['DM_Sans',sans-serif]">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-medium text-gray-900 mb-6 tracking-tight leading-[1.1]">
            Account <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">Settings</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-normal max-w-2xl mx-auto">
            {t?.accountSettings || 'Manage your profile, storage, and legacy preferences.'}
          </p>
        </div>

        <div className="space-y-12">
          {/* Profile Section */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm transition-all">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 tracking-tight underline decoration-emerald-400 decoration-4 underline-offset-4 inline-block">Profile</h2>

            <div className="grid md:grid-cols-[1fr_2fr] gap-12 items-start">
              {/* Avatar Column */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <img
                    src={avatarUrl || session?.user?.image || `https://api.dicebear.com/9.x/croodles/svg?seed=${encodeURIComponent(session?.user?.email || 'user')}`}
                    alt="Avatar"
                    className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/9.x/croodles/svg?seed=${encodeURIComponent(session?.user?.email || 'user')}`
                    }}
                  />
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {session?.user?.image && (
                    <button
                      onClick={() => setAvatarUrl(session.user.image)}
                      className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all hover:scale-110 flex items-center justify-center bg-white ${avatarUrl === session.user.image ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200'}`}
                    >
                      <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                    </button>
                  )}
                  <button
                    onClick={() => setAvatarUrl(`https://api.dicebear.com/9.x/croodles/svg?seed=${Math.random().toString(36).substring(2)}`)}
                    className="w-10 h-10 rounded-full border-2 border-gray-100 hover:border-emerald-500 transition-all flex items-center justify-center bg-gray-50 text-base"
                    title="Random avatar"
                  >🎨</button>
                  <button
                    onClick={() => setAvatarUrl(`https://api.dicebear.com/9.x/pixel-art/svg?seed=${Math.random().toString(36).substring(2)}`)}
                    className="w-10 h-10 rounded-full border-2 border-gray-100 hover:border-cyan-500 transition-all flex items-center justify-center bg-gray-50 text-base"
                    title="Pixel art avatar"
                  >👾</button>
                  <button
                    onClick={() => setAvatarUrl('')}
                    className="w-10 h-10 rounded-full border-2 border-gray-100 hover:border-red-500 transition-all flex items-center justify-center bg-gray-50 text-sm text-gray-400"
                    title="Reset"
                  >✕</button>
                </div>
              </div>

              {/* Form Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Paste custom avatar URL..."
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm outline-none"
                    />
                    <button
                      onClick={handleSaveAvatar}
                      disabled={savingAvatar || !avatarChanged}
                      className={`px-6 rounded-2xl font-medium transition-all flex items-center justify-center ${!avatarChanged
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200'
                        }`}
                    >
                      {savingAvatar ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Save'
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-500 text-sm flex items-center justify-between">
                    <span>{session?.user?.email}</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">Permanent Account</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Public Blog Section */}
          <section className="bg-blue-50/30 rounded-[2.5rem] p-8 md:p-12 border border-blue-100 shadow-sm transition-all">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-blue-400 decoration-4 underline-offset-4 inline-block">Public Blog</h2>
            <p className="text-gray-600 mb-8 max-w-2xl leading-relaxed">
              Claim your personal subdomain to publish your documents as a clean, professional blog. All documents marked as public will automatically appear on your page.
            </p>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative flex items-center">
                  <div className="absolute left-4 text-gray-400 text-sm font-medium border-r border-gray-200 pr-3 hidden sm:block">https://</div>
                  <input
                    type="text"
                    value={testamentUsername}
                    onChange={(e) => setTestamentUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="your-name"
                    className="w-full pl-4 sm:pl-20 pr-32 py-4 bg-white border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm outline-none font-medium"
                  />
                  <div className="absolute right-4 text-gray-400 text-sm font-medium hidden sm:block">.textpad.cloud</div>
                </div>
                <button
                  onClick={handleSaveUsername}
                  disabled={savingUsername || !usernameChanged}
                  className={`px-10 py-4 rounded-2xl font-medium transition-all shadow-lg ${!usernameChanged
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200'
                    }`}
                >
                  {savingUsername ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Save Handle'}
                </button>
              </div>

              {originalUsername && (
                <div className="p-6 bg-white border border-blue-100 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Your blog is live</p>
                    <a
                      href={`https://${originalUsername}.textpad.cloud`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors break-all"
                    >
                      {originalUsername}.textpad.cloud
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(`https://${originalUsername}.textpad.cloud`)}
                      className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                      title="Copy URL"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <a
                      href={`https://${originalUsername}.textpad.cloud`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* External Storage Section */}
          <section className="bg-purple-50/30 rounded-[2.5rem] p-8 md:p-12 border border-purple-100 shadow-sm transition-all">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-purple-400 decoration-4 underline-offset-4 inline-block">External Storage</h2>
            <p className="text-gray-600 mb-8 max-w-2xl leading-relaxed">
              Connect your decentralized storage providers. Files and media will be persisted on IPFS via the providers you configure here.
            </p>

            <div className="space-y-4 mb-8">
              {ipfsProviders.length > 0 ? (
                ipfsProviders.map(p => (
                  <div key={p.id} className="bg-white border border-purple-100 p-6 rounded-3xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        <p className="text-xs font-medium text-purple-500 uppercase tracking-widest">
                          {p.provider === 'filebase' ? `Filebase · ${p.bucket}` : `IPFS Gateway · ${p.gateway}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProvider(p.id)}
                      className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-widest p-2"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-dashed border-purple-200 p-12 rounded-3xl text-center">
                  <p className="text-gray-400 italic font-normal">No external storage providers connected.</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowAddProviderModal(true)}
              className="w-full md:w-auto px-10 py-4 bg-purple-600 text-white font-medium rounded-2xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Provider
            </button>
          </section>

          {/* Digital Legacy Section */}
          <section className="bg-amber-50/30 rounded-[2.5rem] p-8 md:p-12 border border-amber-100 shadow-sm transition-all">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight underline decoration-amber-400 decoration-4 underline-offset-4 inline-block">Digital Legacy</h2>
            <p className="text-gray-600 mb-8 max-w-2xl leading-relaxed">
              Plan for the centennial. Set your birth date to automatically transition your private documents to your public archive on your 99th birthday.
            </p>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex gap-2">
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="flex-1 px-4 py-4 bg-white border border-amber-100 rounded-2xl focus:ring-2 focus:ring-amber-500 transition-all text-sm outline-none font-medium"
                  />
                  {birthDate && (
                    <button
                      onClick={handleClearBirthDate}
                      className="px-4 bg-white border border-amber-100 text-gray-400 hover:text-red-500 rounded-2xl transition-all"
                      title="Clear date"
                    >✕</button>
                  )}
                </div>
                <button
                  onClick={handleSaveBirthDate}
                  disabled={savingBirthDate || !birthDateChanged}
                  className={`px-10 py-4 rounded-2xl font-medium transition-all shadow-lg ${!birthDateChanged
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-amber-200'
                    }`}
                >
                  {savingBirthDate ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Lock Legacy'}
                </button>
              </div>

              {originalBirthDate ? (
                <div className="p-8 bg-white border border-amber-100 rounded-[2rem] space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">⏳</div>
                    <div>
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Legacy Deployment Scheduled</p>
                      <p className="text-lg font-medium text-gray-900">
                        {(() => {
                          const birth = new Date(originalBirthDate)
                          const age99 = new Date(birth)
                          age99.setFullYear(birth.getFullYear() + 99)
                          return age99.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        })()}
                      </p>
                    </div>
                  </div>

                  {originalUsername && (
                    <div className="pt-6 border-t border-amber-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-sm text-gray-500">Documents will be preserved on your public blog.</p>
                      <Link
                        href="/testament/preview"
                        className="w-full sm:w-auto px-6 py-3 bg-amber-50 text-amber-700 font-medium rounded-xl hover:bg-amber-100 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview Legacy
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl text-center italic text-gray-400 text-sm">
                  Legacy mode is not active. No birth date established.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Add Provider Modal - THEMED */}
        {showAddProviderModal && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-gray-100">
              <h3 className="text-2xl font-semibold mb-6 tracking-tight">Add Storage</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Provider Type</label>
                  <select
                    value={newProviderType}
                    onChange={(e) => { setNewProviderType(e.target.value); setIpfsTestResult(null) }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all text-sm outline-none font-medium"
                  >
                    <option value="filebase">Filebase (S3) - Full Sync</option>
                    <option value="storacha_gateway">IPFS Gateway - Read Only</option>
                  </select>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Friendly Name</label>
                    <input type="text" value={newProviderName} onChange={(e) => setNewProviderName(e.target.value)} placeholder="Main Storage" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none font-medium" />
                  </div>

                  {newProviderType === 'filebase' ? (
                    <>
                      <input type="text" value={newAccessKey} onChange={(e) => setNewAccessKey(e.target.value)} placeholder="Access Key" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none font-medium shadow-inner" />
                      <input type="password" value={newSecretKey} onChange={(e) => setNewSecretKey(e.target.value)} placeholder="Secret Key" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none font-medium shadow-inner" />
                      <input type="text" value={newBucket} onChange={(e) => setNewBucket(e.target.value)} placeholder="Bucket Name" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none font-medium shadow-inner" />
                    </>
                  ) : (
                    <>
                      <input type="text" value={newRootCid} onChange={(e) => setNewRootCid(e.target.value)} placeholder="Root CID (bafy...)" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none font-medium shadow-inner" />
                      <input type="text" value={newGateway} onChange={(e) => setNewGateway(e.target.value)} placeholder="Gateway (e.g. w3s.link)" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none font-medium shadow-inner" />
                    </>
                  )}
                </div>

                {ipfsTestResult && (
                  <div className={`p-4 rounded-2xl text-xs font-medium ${ipfsTestResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {ipfsTestResult.success ? '✓ Connection Verified' : `✗ ${ipfsTestResult.error}`}
                  </div>
                )}

                <div className="flex gap-3 pt-6">
                  <button onClick={() => { setShowAddProviderModal(false); setIpfsTestResult(null) }} className="flex-1 py-4 bg-gray-100 text-gray-500 font-medium rounded-2xl hover:bg-gray-200 transition-all">Cancel</button>
                  <button
                    onClick={handleAddProvider}
                    disabled={savingIpfs || (newProviderType === 'filebase' ? (!newAccessKey || !newSecretKey || !newBucket) : !newRootCid)}
                    className="flex-1 py-4 bg-purple-600 text-white font-medium rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 disabled:opacity-50"
                  >
                    {savingIpfs ? 'Adding...' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Nav */}
        <div className="pt-12 mt-20 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400">
            <Link href="/" className="text-gray-900 hover:text-emerald-600 transition-colors font-medium">My Drive</Link>
            {' · '}
            <Link href="/features" className="text-gray-900 hover:text-emerald-600 transition-colors font-medium">Features</Link>
            {' · '}
            <Link href="/privacy" className="text-gray-900 hover:text-emerald-600 transition-colors font-medium">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
