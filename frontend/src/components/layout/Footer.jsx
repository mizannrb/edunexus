import { Link } from 'react-router-dom'
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 text-orange-400" />
              </div>
              <span className="font-heading font-bold text-xl">
                Edu<span className="text-orange-400">Nexus</span>
              </span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Building the Future of Learning Systems. Empowering learners with cutting-edge education.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-orange-400 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              {[['/', 'Home'], ['/courses', 'Courses'], ['/login', 'Login'], ['/register', 'Register']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading font-semibold text-orange-400 mb-3">Categories</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              {['Web Development', 'Data Science', 'Design', 'Business', 'Marketing'].map((cat) => (
                <li key={cat}>
                  <Link to={`/courses?category=${cat}`} className="hover:text-white transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-orange-400 mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-orange-400" />support@edunexus.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-orange-400" />+880 1700-000000</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-400" />Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-800 py-4 text-center text-blue-300 text-sm">
        © 2024 EduNexus. All rights reserved. Built with ❤️ in Bangladesh.
      </div>
    </footer>
  )
}
