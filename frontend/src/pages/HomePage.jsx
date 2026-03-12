import { Link } from 'react-router-dom'
import { BookOpen, Users, Award, TrendingUp, ChevronRight, Star, Play } from 'lucide-react'

const stats = [
  { icon: BookOpen, label: 'Courses', value: '200+', color: 'text-blue-600' },
  { icon: Users, label: 'Students', value: '10,000+', color: 'text-orange-500' },
  { icon: Award, label: 'Certificates', value: '5,000+', color: 'text-green-600' },
  { icon: TrendingUp, label: 'Success Rate', value: '98%', color: 'text-purple-600' },
]

const categories = [
  { name: 'Web Development', icon: '💻', count: 45 },
  { name: 'Data Science', icon: '📊', count: 32 },
  { name: 'Design', icon: '🎨', count: 28 },
  { name: 'Business', icon: '📈', count: 24 },
  { name: 'Marketing', icon: '📣', count: 19 },
  { name: 'Photography', icon: '📷', count: 15 },
]

export default function HomePage() {
  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-orange-300 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                🎓 Bangladesh's Leading EdTech Platform
              </div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl leading-tight mb-6">
                Building the Future of
                <span className="text-orange-400 block">Learning Systems</span>
              </h1>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                Discover thousands of courses taught by expert instructors. Learn at your own pace, earn certificates, and advance your career with EduNexus.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/courses" className="btn-secondary flex items-center gap-2">
                  Explore Courses <ChevronRight className="w-4 h-4" />
                </Link>
                <Link to="/register" className="bg-white text-blue-800 font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2">
                  <Play className="w-4 h-4" /> Start Free
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-4 text-center">
                      <s.icon className={`w-8 h-8 ${s.color} mx-auto mb-2`} />
                      <div className="font-heading font-bold text-2xl text-gray-800">{s.value}</div>
                      <div className="text-gray-500 text-sm">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats mobile */}
      <section className="md:hidden bg-white border-b py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center p-4 bg-gray-50 rounded-xl">
              <s.icon className={`w-7 h-7 ${s.color} mx-auto mb-1`} />
              <div className="font-bold text-xl text-gray-800">{s.value}</div>
              <div className="text-gray-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-3xl text-gray-800 mb-3">Browse Categories</h2>
            <p className="text-gray-500">Find the perfect course for your goals</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/courses?category=${cat.name}`}
                className="card p-5 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <div className="font-semibold text-gray-700 text-sm group-hover:text-blue-700 transition-colors">{cat.name}</div>
                <div className="text-xs text-gray-400 mt-1">{cat.count} courses</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why EduNexus */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-gray-800 mb-3">Why Choose EduNexus?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">We provide the best learning experience with world-class instructors and cutting-edge content.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🏆', title: 'Expert Instructors', desc: 'Learn from industry professionals with years of real-world experience.' },
              { icon: '📱', title: 'Learn Anywhere', desc: 'Access your courses on any device, anytime, anywhere at your own pace.' },
              { icon: '🎯', title: 'Job-Ready Skills', desc: 'Our curriculum is designed to match industry demands and job market needs.' },
            ].map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="font-heading font-bold text-xl text-gray-800 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading font-bold text-3xl text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-orange-100 text-lg mb-8">Join over 10,000 students already learning on EduNexus</p>
          <Link to="/register" className="bg-white text-orange-600 font-bold px-8 py-3 rounded-lg hover:bg-orange-50 transition-colors inline-flex items-center gap-2">
            Get Started for Free <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
