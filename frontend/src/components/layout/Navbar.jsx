import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, Menu, X, User, LogOut, LayoutDashboard, GraduationCap } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout, isAdmin, isLoggedIn } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/courses', label: 'Courses' },
    { to: '/about', label: 'About' },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-blue-800 text-white text-xs py-1.5 px-4 text-center">
        🎓 EduNexus — Building the Future of Learning Systems
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-blue-700 p-2 rounded-lg group-hover:bg-blue-800 transition-colors">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-heading font-bold text-xl text-blue-800">Edu</span>
              <span className="font-heading font-bold text-xl text-orange-500">Nexus</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`nav-link text-sm ${location.pathname === l.to ? 'active' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn() ? (
              <div className="flex items-center gap-3">
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-sm text-blue-700 font-semibold hover:text-blue-900"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-blue-700"
                >
                  <User className="w-4 h-4" />
                  {user?.full_name?.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-outline text-sm py-2 px-5">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Register</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-100 fade-in">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="block py-2 text-sm font-semibold text-gray-700"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {isLoggedIn() ? (
                <>
                  <Link to="/dashboard" className="btn-outline text-sm text-center" onClick={() => setOpen(false)}>Dashboard</Link>
                  {isAdmin() && (
                    <Link to="/admin" className="btn-primary text-sm text-center" onClick={() => setOpen(false)}>Admin Panel</Link>
                  )}
                  <button onClick={handleLogout} className="text-red-500 font-semibold text-sm">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-outline text-sm text-center" onClick={() => setOpen(false)}>Login</Link>
                  <Link to="/register" className="btn-primary text-sm text-center" onClick={() => setOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
