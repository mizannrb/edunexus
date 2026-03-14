import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Clock, Award, TrendingUp, Play, Loader2, KeyRound, Eye, EyeOff, User, Mail } from 'lucide-react'
import { enrollmentsAPI } from '../services/api'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('courses')

  // Password Change State
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    enrollmentsAPI.myEnrollments()
      .then(({ data }) => setEnrollments(data))
      .catch(() => toast.error('Failed to load enrollments'))
      .finally(() => setLoading(false))
  }, [])

  const completed = enrollments.filter(e => e.is_completed).length
  const inProgress = enrollments.filter(e => !e.is_completed).length

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('New passwords do not match!')
      return
    }
    if (passwords.new_password.length < 8) {
      toast.error('New password must be at least 8 characters!')
      return
    }
    setChangingPassword(true)
    try {
      await api.put('/users/me/password', {
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      })
      toast.success('Password changed successfully! 🎉')
      setPasswords({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Password change failed')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-bold text-3xl">
            Welcome back, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-blue-200 mt-1">Continue your learning journey</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BookOpen, label: 'Total Enrolled', value: enrollments.length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Play, label: 'In Progress', value: inProgress, color: 'text-orange-500', bg: 'bg-orange-50' },
            { icon: Award, label: 'Completed', value: completed, color: 'text-green-600', bg: 'bg-green-50' },
            { icon: TrendingUp, label: 'Avg Progress', value: `${enrollments.length ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length) : 0}%`, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((s) => (
            <div key={s.label} className={`card p-5 ${s.bg}`}>
              <s.icon className={`w-7 h-7 ${s.color} mb-2`} />
              <div className="font-bold text-2xl text-gray-800">{s.value}</div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { key: 'courses', label: '📚 My Courses' },
            { key: 'profile', label: '👤 Profile & Password' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 font-semibold text-sm rounded-t-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-700 border border-b-white border-gray-200 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: COURSES ── */}
        {activeTab === 'courses' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-bold text-xl text-gray-800">My Courses</h2>
              <Link to="/courses" className="text-blue-700 font-semibold text-sm hover:text-blue-900">Browse More</Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="font-heading font-bold text-xl text-gray-400">No courses yet</h3>
                <p className="text-gray-400 mt-1 mb-6">Start learning today!</p>
                <Link to="/courses" className="btn-primary">Explore Courses</Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 h-32 flex items-center justify-center">
                      {enrollment.course_thumbnail
                        ? <img src={enrollment.course_thumbnail} alt="" className="w-full h-full object-cover" />
                        : <BookOpen className="w-12 h-12 text-blue-400" />
                      }
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-3">
                        {enrollment.course_title || 'Course'}
                      </h3>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>
                      {enrollment.is_completed ? (
                        <span className="badge bg-green-100 text-green-700 w-full justify-center mt-2">
                          ✅ Completed
                        </span>
                      ) : (
                        <button className="btn-primary w-full text-sm py-2 mt-2">Continue</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: PROFILE & PASSWORD ── */}
        {activeTab === 'profile' && (
          <div className="grid md:grid-cols-2 gap-6">

            {/* Profile Info */}
            <div className="card p-6">
              <h2 className="font-heading font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> Profile Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-800 font-medium">{user?.full_name}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Email Address</label>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-800 font-medium">{user?.email}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Account Type</label>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span className={`font-semibold ${user?.is_admin ? 'text-orange-600' : 'text-blue-600'}`}>
                      {user?.is_admin ? '👑 Admin' : '👤 Student'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Total Courses</label>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-800 font-medium">{enrollments.length} courses enrolled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="card p-6">
              <h2 className="font-heading font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" /> Change Password
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">

                {/* Current Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder="Enter current password"
                      value={passwords.current_password}
                      onChange={e => setPasswords({ ...passwords, current_password: e.target.value })}
                      required
                    />
                    <button type="button"
                      onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder="Enter new password (min 8 characters)"
                      value={passwords.new_password}
                      onChange={e => setPasswords({ ...passwords, new_password: e.target.value })}
                      required
                      minLength={8}
                    />
                    <button type="button"
                      onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength Indicator */}
                  {passwords.new_password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full ${
                            passwords.new_password.length >= i * 3
                              ? i <= 1 ? 'bg-red-400'
                              : i <= 2 ? 'bg-yellow-400'
                              : i <= 3 ? 'bg-blue-400'
                              : 'bg-green-500'
                              : 'bg-gray-200'
                          }`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {passwords.new_password.length < 4 ? 'Too weak'
                          : passwords.new_password.length < 7 ? 'Weak'
                          : passwords.new_password.length < 10 ? 'Good'
                          : 'Strong'} password
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder="Confirm new password"
                      value={passwords.confirm_password}
                      onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })}
                      required
                    />
                    <button type="button"
                      onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Match indicator */}
                  {passwords.confirm_password && (
                    <p className={`text-xs mt-1 ${
                      passwords.new_password === passwords.confirm_password
                        ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {passwords.new_password === passwords.confirm_password
                        ? '✅ Passwords match'
                        : '❌ Passwords do not match'}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                >
                  {changingPassword
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Changing...</>
                    : <><KeyRound className="w-4 h-4" />Change Password</>
                  }
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}