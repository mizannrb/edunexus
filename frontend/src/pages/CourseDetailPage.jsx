import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { BookOpen, Clock, Users, ChevronDown, ChevronUp, Play, CheckCircle, Loader2 } from 'lucide-react'
import { coursesAPI, enrollmentsAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function CourseDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [expandedModules, setExpandedModules] = useState({})

  useEffect(() => {
    coursesAPI.get(slug)
      .then(({ data }) => setCourse(data))
      .catch(() => navigate('/courses'))
      .finally(() => setLoading(false))
  }, [slug])

  const handleEnroll = async () => {
    if (!isLoggedIn()) { navigate('/login'); return }
    setEnrolling(true)
    try {
      await enrollmentsAPI.enroll(course.id)
      toast.success('Successfully enrolled! 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  const toggleModule = (id) => setExpandedModules(p => ({ ...p, [id]: !p[id] }))

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
    </div>
  )
  if (!course) return null

  const totalLessons = course.modules?.reduce((sum, m) => sum + m.lessons?.length, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge bg-white/20 text-white capitalize">{course.level}</span>
                {course.category && <span className="badge bg-orange-500/80 text-white">{course.category}</span>}
              </div>
              <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">{course.title}</h1>
              {course.short_description && (
                <p className="text-blue-100 text-lg mb-6">{course.short_description}</p>
              )}
              <div className="flex flex-wrap gap-6 text-sm text-blue-200">
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{course.duration_hours}h total</div>
                <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{totalLessons} lessons</div>
                <div className="flex items-center gap-1.5"><Users className="w-4 h-4" />{course.enrollment_count} enrolled</div>
                {course.instructor_name && <div>👨‍🏫 {course.instructor_name}</div>}
              </div>
            </div>

            {/* Enrollment card */}
            <div className="card p-6">
              <div className="text-3xl font-bold text-blue-700 mb-1">
                {course.is_free ? <span className="text-green-600">FREE</span> : `৳${course.price}`}
              </div>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="btn-secondary w-full flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
              >
                {enrolling ? <><Loader2 className="w-4 h-4 animate-spin" />Enrolling...</> : '🎯 Enroll Now'}
              </button>
              {!isLoggedIn() && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  <Link to="/login" className="text-blue-700 font-semibold">Login</Link> to enroll
                </p>
              )}
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Lifetime access</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Certificate on completion</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Mobile & desktop access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            {course.description && (
              <div className="card p-6">
                <h2 className="font-heading font-bold text-xl text-gray-800 mb-4">About This Course</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{course.description}</p>
              </div>
            )}

            {/* Curriculum */}
            <div className="card p-6">
              <h2 className="font-heading font-bold text-xl text-gray-800 mb-4">Course Curriculum</h2>
              <p className="text-sm text-gray-500 mb-4">{course.modules?.length} modules • {totalLessons} lessons</p>

              {course.modules?.length === 0 && (
                <p className="text-gray-400 text-center py-8">No content yet. Stay tuned!</p>
              )}

              <div className="space-y-3">
                {course.modules?.map((module) => (
                  <div key={module.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-800">{module.title}</span>
                        <span className="text-xs text-gray-400">{module.lessons?.length} lessons</span>
                      </div>
                      {expandedModules[module.id] ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    </button>

                    {expandedModules[module.id] && (
                      <ul className="divide-y divide-gray-100">
                        {module.lessons?.map((lesson) => (
                          <li key={lesson.id} className="flex items-center gap-3 px-4 py-3">
                            <Play className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="text-sm text-gray-700 flex-1">{lesson.title}</span>
                            {lesson.is_preview && <span className="badge bg-green-100 text-green-700">Preview</span>}
                            {lesson.duration_minutes > 0 && (
                              <span className="text-xs text-gray-400">{lesson.duration_minutes}m</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-heading font-bold text-lg text-gray-800 mb-3">Course Info</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex justify-between"><span className="font-medium">Level</span><span className="capitalize">{course.level}</span></li>
                <li className="flex justify-between"><span className="font-medium">Duration</span><span>{course.duration_hours}h</span></li>
                <li className="flex justify-between"><span className="font-medium">Lessons</span><span>{totalLessons}</span></li>
                <li className="flex justify-between"><span className="font-medium">Students</span><span>{course.enrollment_count}</span></li>
                <li className="flex justify-between"><span className="font-medium">Language</span><span>Bengali / English</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
