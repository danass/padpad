'use client'


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function AdminPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState(null)
  const [documents, setDocuments] = useState([])
  const [users, setUsers] = useState([])
  const [tempDocs, setTempDocs] = useState([])
  const [activeTab, setActiveTab] = useState('stats')
  const [documentsPage, setDocumentsPage] = useState(1)
  const [documentsTotalPages, setDocumentsTotalPages] = useState(1)
  const [settingAdmin, setSettingAdmin] = useState(null)
  // Search and sort state for all tabs
  const [userSearch, setUserSearch] = useState('')
  const [userSort, setUserSort] = useState({ field: 'last_activity', dir: 'desc' })
  const [docSearch, setDocSearch] = useState('')
  const [docSort, setDocSort] = useState({ field: 'updated_at', dir: 'desc' })
  const [tempSearch, setTempSearch] = useState('')
  const [tempSort, setTempSort] = useState({ field: 'created_at', dir: 'desc' })

  // Sortable header component
  const SortHeader = ({ label, field, sort, setSort }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => setSort(prev => ({
        field,
        dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc'
      }))}
    >
      <div className="flex items-center gap-1">
        {label}
        {sort.field === field && (
          <span className="text-gray-400">{sort.dir === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  )

  useEffect(() => {
    checkAdminStatus()
  }, [session])

  useEffect(() => {
    if (isAdmin) {
      loadStats()
      loadUsers()
    }
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin && activeTab === 'documents') {
      loadDocuments()
    }
  }, [isAdmin, activeTab, documentsPage])

  useEffect(() => {
    if (isAdmin && activeTab === 'temp') {
      loadTempDocs()
    }
  }, [isAdmin, activeTab])

  const checkAdminStatus = async () => {
    if (!session?.user?.email) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/check')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin)
        if (!data.isAdmin) {
          router.push('/drive')
        }
      } else {
        setIsAdmin(false)
        router.push('/drive')
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
      router.push('/drive')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadDocuments = async () => {
    try {
      const response = await fetch(`/api/admin/documents?page=${documentsPage}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents)
        setDocumentsTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadTempDocs = async () => {
    try {
      const response = await fetch('/api/admin/temp-docs')
      if (response.ok) {
        const data = await response.json()
        setTempDocs(data.documents)
      }
    } catch (error) {
      console.error('Error loading temp documents:', error)
    }
  }

  const handleUpdateUser = async (email, updates) => {
    setSettingAdmin(email)
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        // Reload users
        await loadUsers()
      } else {
        alert('Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Failed to update user status')
    } finally {
      setSettingAdmin(null)
    }
  }

  const handleSuspendUser = async (email, suspend) => {
    const action = suspend ? 'suspend' : 'unsuspend'
    if (!confirm(`Are you sure you want to ${action} ${email}?${suspend ? ' They will receive an email notification.' : ''}`)) {
      return
    }

    setSettingAdmin(email)
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(email)}/suspend`, {
        method: suspend ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Account suspended by administrator' })
      })

      if (response.ok) {
        const data = await response.json()
        if (suspend && data.emailSent) {
          alert(`User suspended. Email sent. ${data.documentsUnpublished} documents unpublished.`)
        } else if (suspend) {
          alert(`User suspended. Email failed to send. ${data.documentsUnpublished} documents unpublished.`)
        }
        await loadUsers()
      } else {
        const data = await response.json()
        alert(data.error || `Failed to ${action} user`)
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error)
      alert(`Failed to ${action} user`)
    } finally {
      setSettingAdmin(null)
    }
  }

  const handleDeleteUser = async (email) => {
    if (!confirm(`⚠️ PERMANENTLY DELETE ${email}?\n\nThis will delete:\n• All documents\n• All snapshots\n• All folders\n\nThis action CANNOT be undone!`)) {
      return
    }

    // Double confirm
    const confirmText = prompt(`Type the email "${email}" to confirm deletion:`)
    if (confirmText !== email) {
      alert('Deletion cancelled - email did not match')
      return
    }

    setSettingAdmin(email)
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        alert(`User deleted.\n\nRemoved:\n• ${data.deleted.documents} documents\n• ${data.deleted.snapshots} snapshots\n• ${data.deleted.folders} folders`)
        await loadUsers()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    } finally {
      setSettingAdmin(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">{t?.loadingText || 'Loading...'}</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t?.adminPanel || 'Admin Panel'}</h1>
          <p className="text-gray-600">{t?.manageDocsUsersAdmins || 'Manage documents, users, and admin access'}</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'stats'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {t?.statistics || 'Statistics'}
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'documents'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {t?.documents || 'Documents'}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {t?.usersAndAdmins || 'Users & Admins'}
            </button>
            <button
              onClick={() => setActiveTab('temp')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'temp'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Temp Pads
            </button>
          </nav>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">{t?.totalDocuments || 'Total Documents'}</div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalDocuments}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">{t?.totalUsers || 'Total Users'}</div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">{t?.totalSnapshots || 'Total Snapshots'}</div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalSnapshots}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">{t?.recent7Days || 'Recent (7 days)'}</div>
                <div className="text-3xl font-bold text-gray-900">{stats.recentDocuments}</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t?.documentsByUser || 'Documents by User'}</h2>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Search user..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black w-48"
                  />
                  <button
                    onClick={() => setUserSort(prev => ({ field: 'count', dir: prev.dir === 'asc' ? 'desc' : 'asc' }))}
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    Sort {userSort.dir === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {stats.documentsByUser
                  .filter(item => (item.user_email || '').toLowerCase().includes(userSearch.toLowerCase()))
                  .sort((a, b) => (userSort.dir === 'asc' ? 1 : -1) * (a.count - b.count))
                  .map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="text-sm text-gray-900 truncate pr-4">{item.user_email || (t?.noUser || 'No user')}</div>
                      <div className="text-sm font-medium text-gray-600 shrink-0">{item.count} {t?.documents || 'docs'}</div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Search */}
              <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
                <input
                  type="text"
                  placeholder="Search by title or email..."
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black w-64"
                />
                <span className="text-sm text-gray-500">
                  {documents.filter(d =>
                    d.title?.toLowerCase().includes(docSearch.toLowerCase()) ||
                    d.user_email?.toLowerCase().includes(docSearch.toLowerCase())
                  ).length} documents
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <SortHeader label={t?.title || 'Title'} field="title" sort={docSort} setSort={setDocSort} />
                      <SortHeader label={t?.user || 'User'} field="user_email" sort={docSort} setSort={setDocSort} />
                      <SortHeader label={t?.created || 'Created'} field="created_at" sort={docSort} setSort={setDocSort} />
                      <SortHeader label={t?.updated || 'Updated'} field="updated_at" sort={docSort} setSort={setDocSort} />
                      <SortHeader label={t?.snapshots || 'Snapshots'} field="snapshot_count" sort={docSort} setSort={setDocSort} />
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t?.events || 'Events'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t?.publicLabel || 'Public'}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t?.actions || 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents
                      .filter(d =>
                        d.title?.toLowerCase().includes(docSearch.toLowerCase()) ||
                        d.user_email?.toLowerCase().includes(docSearch.toLowerCase())
                      )
                      .sort((a, b) => {
                        const field = docSort.field
                        const dir = docSort.dir === 'asc' ? 1 : -1
                        if (field === 'title' || field === 'user_email') return dir * (a[field] || '').localeCompare(b[field] || '')
                        if (field === 'snapshot_count') return dir * ((a[field] || 0) - (b[field] || 0))
                        if (field === 'created_at' || field === 'updated_at') {
                          const aDate = a[field] ? new Date(a[field]).getTime() : 0
                          const bDate = b[field] ? new Date(b[field]).getTime() : 0
                          return dir * (aDate - bDate)
                        }
                        return 0
                      })
                      .map((doc) => (
                        <tr key={doc.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/doc/${doc.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                            >
                              {doc.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{doc.user_email || (t?.noUser || 'No user')}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {new Date(doc.updated_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{doc.snapshot_count}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{doc.event_count}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              {doc.is_public ? (
                                <span className="text-green-600">Yes</span>
                              ) : (
                                <span className="text-gray-400">No</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link
                              href={`/doc/${doc.id}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {documentsTotalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setDocumentsPage(p => Math.max(1, p - 1))}
                  disabled={documentsPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="text-sm text-gray-600">
                  Page {documentsPage} of {documentsTotalPages}
                </div>
                <button
                  onClick={() => setDocumentsPage(p => Math.min(documentsTotalPages, p + 1))}
                  disabled={documentsPage === documentsTotalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
              <input
                type="text"
                placeholder="Search by email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black w-64"
              />
              <span className="text-sm text-gray-500">
                {users.filter(u => u.email.toLowerCase().includes(userSearch.toLowerCase())).length} users
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <SortHeader label="Email" field="email" sort={userSort} setSort={setUserSort} />
                    <SortHeader label="Documents" field="document_count" sort={userSort} setSort={setUserSort} />
                    <SortHeader label="First Created" field="first_created" sort={userSort} setSort={setUserSort} />
                    <SortHeader label="Last Activity" field="last_activity" sort={userSort} setSort={setUserSort} />
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users
                    .filter(u => u.email.toLowerCase().includes(userSearch.toLowerCase()))
                    .sort((a, b) => {
                      const field = userSort.field
                      const dir = userSort.dir === 'asc' ? 1 : -1
                      if (field === 'email') return dir * a.email.localeCompare(b.email)
                      if (field === 'document_count') return dir * ((a.document_count || 0) - (b.document_count || 0))
                      if (field === 'first_created' || field === 'last_activity') {
                        const aDate = a[field] ? new Date(a[field]).getTime() : 0
                        const bDate = b[field] ? new Date(b[field]).getTime() : 0
                        return dir * (aDate - bDate)
                      }
                      return 0
                    })
                    .map((user) => (
                      <tr key={user.email}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{user.document_count}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {user.first_created ? new Date(user.first_created).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {user.last_activity ? new Date(user.last_activity).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.isAdmin ? 'admin' : (user.role === 'curator' ? 'curator' : 'user')}
                            onChange={(e) => {
                              const newRole = e.target.value
                              handleUpdateUser(user.email, {
                                isAdmin: newRole === 'admin',
                                role: newRole === 'admin' ? 'admin' : (newRole === 'curator' ? 'curator' : 'user')
                              })
                            }}
                            disabled={settingAdmin === user.email}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50"
                          >
                            <option value="user">User</option>
                            <option value="curator">Curator</option>
                            <option value="admin">Admin</option>
                          </select>
                          {settingAdmin === user.email && <span className="ml-2 text-xs text-gray-400">Updating...</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.isSuspended ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">Suspended</span>
                              <button
                                onClick={() => handleSuspendUser(user.email, false)}
                                disabled={settingAdmin === user.email}
                                className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                              >
                                Unsuspend
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSuspendUser(user.email, true)}
                              disabled={settingAdmin === user.email || user.isAdmin}
                              className="text-xs text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                              title={user.isAdmin ? 'Cannot suspend admins' : 'Suspend this user'}
                            >
                              Suspend
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteUser(user.email)}
                            disabled={settingAdmin === user.email || user.isAdmin}
                            className="text-xs text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title={user.isAdmin ? 'Cannot delete admins' : 'Permanently delete user and all data'}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Temp Pads Tab */}
        {activeTab === 'temp' && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Temporary Documents</h2>
                <p className="text-sm text-gray-500">Disposable documents that expire after 48 hours</p>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search by title or ID..."
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black w-64"
                />
                <span className="text-sm text-gray-500">
                  {tempDocs.filter(d =>
                    d.title?.toLowerCase().includes(tempSearch.toLowerCase()) ||
                    d.id.toLowerCase().includes(tempSearch.toLowerCase())
                  ).length} pads
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <SortHeader label="ID" field="id" sort={tempSort} setSort={setTempSort} />
                    <SortHeader label="Title" field="title" sort={tempSort} setSort={setTempSort} />
                    <SortHeader label="Created" field="created_at" sort={tempSort} setSort={setTempSort} />
                    <SortHeader label="Expires" field="expires_at" sort={tempSort} setSort={setTempSort} />
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Left</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tempDocs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                        No temporary documents found
                      </td>
                    </tr>
                  ) : (
                    tempDocs
                      .filter(d =>
                        d.title?.toLowerCase().includes(tempSearch.toLowerCase()) ||
                        d.id.toLowerCase().includes(tempSearch.toLowerCase())
                      )
                      .sort((a, b) => {
                        const field = tempSort.field
                        const dir = tempSort.dir === 'asc' ? 1 : -1
                        if (field === 'id' || field === 'title') return dir * (a[field] || '').localeCompare(b[field] || '')
                        if (field === 'created_at' || field === 'expires_at') {
                          const aDate = a[field] ? new Date(a[field]).getTime() : 0
                          const bDate = b[field] ? new Date(b[field]).getTime() : 0
                          return dir * (aDate - bDate)
                        }
                        return 0
                      })
                      .map((doc) => {
                        const expiresAt = new Date(doc.expires_at)
                        const now = new Date()
                        const timeLeft = Math.max(0, expiresAt - now)
                        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
                        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

                        return (
                          <tr key={doc.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-xs font-mono text-gray-600">{doc.id.substring(0, 8)}...</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">{doc.title || 'Untitled'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {new Date(doc.created_at).toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {expiresAt.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${hoursLeft < 6 ? 'text-red-600' : 'text-gray-900'}`}>
                                {hoursLeft}h {minutesLeft}m
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link
                                href={`/public/temp/${doc.id}`}
                                className="text-sm text-blue-600 hover:text-blue-800"
                                target="_blank"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        )
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



