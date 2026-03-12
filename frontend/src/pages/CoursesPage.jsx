import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, BookOpen, Clock, Users, Star, Filter, ChevronRight, Loader2 } from 'lucide-react'
import { coursesAPI } from '../services/api'
import toast from 'react-hot-toast'

const LEVELS = ['beginner', 'intermediate', 'advanced']
const CATEGORIES = ['Web Development', 'Data Science', 'Design', 'Business', 'Marketing', 'Photography']

const levelColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.slug}`} className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
      <div className="bg-gradient-to-br from-blue-100 to-blue-200 h-44 flex items-center justify-center">
        {course.thumbnail_url
          ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
          : <BookOpen className="w-16 h-16 text-blue-400" />
        }
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className={`badge ${levelColors[course.level] || 'bg-gray-100 text-gray-600'}`}>
            {course.level}
          </span>
          {course.category && (
            <span className="badge bg-blue-50 text-blue-700">{course.category}</span>
          )}
        </div>
        <h3 className="font-heading font-bold text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-2 mb-2">
          {course.title}
        </h3>
        {course.short_description && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">{course.short_description}</p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3 mt-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration_hours}h</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.enrollment_count}</span>
          </div>
          <div className="font-bold text-blue-700">
            {course.is_free ? <span className="text-green-600">FREE</span> : `৳${course.price}`}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const level = searchParams.get('level') || ''

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = { page, size: 12 }
      if (search) params.search = search
      if (category) params.category = category
      if (level) params.level = level
      const { data } = await coursesAPI.list(params)
      setCourses(data.items)
      setTotal(data.total)
      setPages(data.pages)
    } catch {
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCourses() }, [page, search, category, level])

  const setFilter = (key, value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    setSearchParams(p)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading font-bold text-3xl mb-4">Explore All Courses</h1>
          <p className="text-blue-200 mb-6">Learn from world-class instructors and advance your career</p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <Filter className="w-4 h-4" /> Filter:
          </div>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter('category', category === cat ? '' : cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                category === cat ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 hover:bg-blue-50 border'
              }`}
            >
              {cat}
            </button>
          ))}
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter('level', level === lvl ? '' : lvl)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${
                level === lvl ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50 border'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm"><strong className="text-gray-800">{total}</strong> courses found</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-heading font-bold text-xl text-gray-500">No courses found</h3>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg font-semibold text-sm transition-all ${
                  page === p ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 hover:bg-blue-50 border'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
