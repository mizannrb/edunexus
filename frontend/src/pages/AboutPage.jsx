import { GraduationCap, Users, BookOpen, Award, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

const team = [
  { name: 'Md. Mizan', role: 'Founder & CEO', emoji: '👨‍💼' },
  { name: 'Sarah Ahmed', role: 'Head of Content', emoji: '👩‍🏫' },
  { name: 'Rahim Uddin', role: 'Lead Developer', emoji: '👨‍💻' },
  { name: 'Fatima Begum', role: 'Marketing Head', emoji: '👩‍💼' },
]

const stats = [
  { icon: BookOpen, label: 'Courses', value: '200+', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Users, label: 'Students', value: '10,000+', color: 'text-orange-500', bg: 'bg-orange-50' },
  { icon: Award, label: 'Certificates', value: '5,000+', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: TrendingUp, label: 'Success Rate', value: '98%', color: 'text-purple-600', bg: 'bg-purple-50' },
]

const values = [
  { icon: '🎯', title: 'আমাদের লক্ষ্য', desc: 'বাংলাদেশের প্রতিটি মানুষের কাছে মানসম্মত শিক্ষা পৌঁছে দেওয়া।' },
  { icon: '👁️', title: 'আমাদের দৃষ্টিভঙ্গি', desc: 'একটি এমন পৃথিবী গড়া যেখানে শিক্ষা সবার জন্য সমান সুযোগ নিয়ে আসে।' },
  { icon: '❤️', title: 'আমাদের মূল্যবোধ', desc: 'শিক্ষার্থীদের সাফল্যই আমাদের সাফল্য। মানসম্মত কন্টেন্ট আমাদের প্রতিশ্রুতি।' },
]

const features = [
  { emoji: '🎓', text: 'Expert Instructors' },
  { emoji: '📱', text: 'Mobile Friendly' },
  { emoji: '🏆', text: 'Certificates' },
  { emoji: '🌍', text: 'Learn Anywhere' },
  { emoji: '💬', text: 'Community Support' },
  { emoji: '🔄', text: 'Lifetime Access' },
]

export default function AboutPage() {
  return (
    <div className="fade-in">

      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center bg-white/10 p-4 rounded-2xl mb-6">
            <GraduationCap className="w-12 h-12 text-orange-400" />
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">
            আমাদের সম্পর্কে
          </h1>
          <p className="text-blue-100 text-xl max-w-3xl mx-auto leading-relaxed">
            EduNexus হলো বাংলাদেশের অন্যতম Leading EdTech Platform।
            আমাদের লক্ষ্য Building the Future of Learning Systems।
          </p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className={`card p-6 text-center ${s.bg}`}>
                <s.icon className={`w-8 h-8 ${s.color} mx-auto mb-3`} />
                <div className="font-heading font-bold text-3xl text-gray-800">{s.value}</div>
                <div className="text-gray-500 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading font-bold text-3xl text-gray-800 mb-6">
                আমাদের <span className="text-blue-700">গল্প</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>২০২৪ সালে EduNexus এর যাত্রা শুরু হয় একটি সহজ স্বপ্ন নিয়ে — বাংলাদেশের প্রতিটি কোণে মানসম্মত শিক্ষা পৌঁছে দেওয়া।</p>
                <p>আমরা লক্ষ্য করেছিলাম অনেক মেধাবী তরুণ শুধুমাত্র সঠিক গাইডেন্স ও সুযোগের অভাবে পিছিয়ে পড়ছে। EduNexus সেই সুযোগ তৈরি করতে এসেছে।</p>
                <p>আজ আমাদের প্ল্যাটফর্মে ২০০+ কোর্স, ১০,০০০+ শিক্ষার্থী এবং অভিজ্ঞ ইন্সট্রাক্টরদের নিয়ে আমরা এগিয়ে চলেছি।</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-orange-100 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-4">
                {features.map((item) => (
                  <div key={item.text} className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <div className="text-3xl mb-2">{item.emoji}</div>
                    <div className="text-sm font-semibold text-gray-700">{item.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-gray-800 mb-3">আমাদের লক্ষ্য ও মূল্যবোধ</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="card p-8 text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{v.icon}</div>
                <h3 className="font-heading font-bold text-xl text-gray-800 mb-3">{v.title}</h3>
                <p className="text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-gray-800 mb-3">আমাদের টিম</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="card p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-6xl mb-4">{member.emoji}</div>
                <h3 className="font-heading font-bold text-gray-800">{member.name}</h3>
                <p className="text-blue-600 text-sm font-semibold mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-heading font-bold text-3xl mb-4">আজই শুরু করুন!</h2>
          <p className="text-blue-200 text-lg mb-8">১০,০০০+ শিক্ষার্থীর সাথে যোগ দিন</p>
          <Link
            to="/register"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-lg transition-colors inline-block"
          >
            বিনামূল্যে শুরু করুন
          </Link>
        </div>
      </section>

    </div>
  )
}