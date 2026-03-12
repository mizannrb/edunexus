import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, BookOpen, TrendingUp, LayoutDashboard, Plus, Edit, Trash2, Shield, ShieldOff, Loader2, Eye, CheckCircle, XCircle } from 'lucide-react'
import { enrollmentsAPI, coursesAPI, usersAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const TAB = { OVERVIEW: 'overview', COURSES: 'courses', USERS: 'users' }

export default function AdminPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState(TAB.OVERVIEW)
  const [stats, setStats] = useState(null)
  const [courses, setCourses] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [tab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (tab === TAB.OVERVIEW) {
        const { data } = await enrollmentsAPI.stats()
        setStats(data)
      } else if (tab === TAB.COURSES) {
        const { data } = await coursesAPI.adminList({ page: 1, size: 50 })
        setCourses(data.items)
      } else if (tab === TAB.USERS) {
        const { data } = await usersAPI.list({ limit: 50 })
        setUsers(data)
      }
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const deleteCourse = async (id) => {
    if (!confirm('Delete this course?')) return
    try {
      await coursesAPI.delete(id)
      setCourses(c => c.filter(x => x.id !== id))
      toast.success('Course deleted')
    } catch { toast.error('Failed to delete course') }
  }

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return
    try {
      await usersAPI.delete(id)
      setUsers(u => u.filter(x => x.id !== id))
      toast.success('User deleted')
    } catch { toast.error('Failed to delete user') }
  }

  const toggleAdmin = async (u) => {
    try {
      if (u.is_admin) {
        await usersAPI.revokeAdmin(u.id)
        toast.success('Admin revoked')
      } else {
        await usersAPI.makeAdmin(u.id)
        toast.success('Admin granted')
      }
      setUsers(users => users.map(x => x.id === u.id ? { ...x, is_admin: !x.is_admin } : x))
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed') }
  }

  const statusColor = { published: 'bg-green-100 text-green-700', draft: 'bg-yellow-100 text-yellow-700', archived: 'bg-gray-100 text-gray-600' }

  const tabBtns = [
    { key: TAB.OVERVIEW, label: 'Overview', icon: LayoutDashboard },
    { key: TAB.COURSES, label: 'Courses', icon: BookOpen },
    { key: TAB.USERS, label: 'Users', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-bold text-3xl flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8" /> Admin Dashboard
          </h1>
          <p className="text-blue-200 mt-1">Manage your EduNexus platform</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {tabBtns.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-5 py-4 font-semibold text-sm border-b-2 transition-colors ${
                  tab === key ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === TAB.OVERVIEW && stats && (
              <div className="fade-in">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Total Users', value: stats.total_users, color: 'text-blue-600', bg: 'bg-blue-50', icon: Users },
                    { label: 'Total Courses', value: stats.total_courses, color: 'text-orange-500', bg: 'bg-orange-50', icon: BookOpen },
                    { label: 'Enrollments', value: stats.total_enrollments, color: 'text-green-600', bg: 'bg-green-50', icon: TrendingUp },
                    { label: 'Published', value: stats.published_courses, color: 'text-purple-600', bg: 'bg-purple-50', icon: CheckCircle },
                    { label: 'Active Users', value: stats.active_users, color: 'text-teal-600', bg: 'bg-teal-50', icon: Users },
                  ].map((s) => (
                    <div key={s.label} className={`card p-5 ${s.bg}`}>
                      <s.icon className={`w-7 h-7 ${s.color} mb-2`} />
                      <div className="font-bold text-2xl text-gray-800">{s.value}</div>
                      <div className="text-gray-500 text-sm">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/admin/courses/new" className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Course
                  </Link>
                  <button onClick={() => setTab(TAB.COURSES)} className="btn-outline flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Manage Courses
                  </button>
                  <button onClick={() => setTab(TAB.USERS)} className="btn-outline flex items-center gap-2">
                    <Users className="w-4 h-4" /> Manage Users
                  </button>
                </div>
              </div>
            )}

            {/* COURSES */}
            {tab === TAB.COURSES && (
              <div className="fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading font-bold text-xl text-gray-800">All Courses ({courses.length})</h2>
                  <Link to="/admin/courses/new" className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Course
                  </Link>
                </div>
                <div className="card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        {['Title', 'Category', 'Level', 'Status', 'Enrolled', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {courses.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800 max-w-xs">
                            <div className="truncate">{c.title}</div>
                            <div className="text-xs text-gray-400">{c.is_free ? 'Free' : `৳${c.price}`}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{c.category || '—'}</td>
                          <td className="px-4 py-3 capitalize text-gray-500">{c.level}</td>
                          <td className="px-4 py-3">
                            <span className={`badge ${statusColor[c.status] || ''}`}>{c.status}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{c.enrollment_count}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Link to={`/courses/${c.slug}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link to={`/admin/courses/${c.id}/edit`} className="p-1.5 text-orange-500 hover:bg-orange-50 rounded">
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button onClick={() => deleteCourse(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {courses.length === 0 && (
                    <div className="text-center py-12 text-gray-400">No courses yet. <Link to="/admin/courses/new" className="text-blue-700 font-semibold">Create one!</Link></div>
                  )}
                </div>
              </div>
            )}

            {/* USERS */}
            {tab === TAB.USERS && (
              <div className="fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading font-bold text-xl text-gray-800">All Users ({users.length})</h2>
                </div>
                <div className="card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{u.full_name}</td>
                          <td className="px-4 py-3 text-gray-500">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`badge ${u.is_admin ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                              {u.is_admin ? '👑 Admin' : 'Student'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {u.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {u.id !== user?.id && (
                                <>
                                  <button
                                    onClick={() => toggleAdmin(u)}
                                    className={`p-1.5 rounded ${u.is_admin ? 'text-orange-500 hover:bg-orange-50' : 'text-blue-600 hover:bg-blue-50'}`}
                                    title={u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                                  >
                                    {u.is_admin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                  </button>
                                  <button onClick={() => deleteUser(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {u.id === user?.id && <span className="text-xs text-gray-400">You</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
