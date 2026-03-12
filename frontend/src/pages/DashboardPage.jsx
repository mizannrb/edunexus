import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Clock, Award, TrendingUp, Play, Loader2 } from 'lucide-react'
import { enrollmentsAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    enrollmentsAPI.myEnrollments()
      .then(({ data }) => setEnrollments(data))
      .catch(() => toast.error('Failed to load enrollments'))
      .finally(() => setLoading(false))
  }, [])

  const completed = enrollments.filter(e => e.is_completed).length
  const inProgress = enrollments.filter(e => !e.is_completed).length

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

        {/* Courses */}
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
                    {/* Progress bar */}
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
      </div>
    </div>
  )
}
