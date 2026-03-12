import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await login(form.email, form.password)
      toast.success(`Welcome back, ${data.user.full_name}!`)
      navigate(data.user.is_admin ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md fade-in">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-blue-700 p-3 rounded-xl mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-gray-800">
              Welcome to <span className="text-blue-700">Edu</span><span className="text-orange-500">Nexus</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Sign in to continue learning</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-700 font-semibold hover:text-blue-900">
              Create account
            </Link>
          </div>

          {/* Demo hint */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 text-center">
            <strong>Demo Admin:</strong> admin@edunexus.com / Admin@123456
          </div>
        </div>
      </div>
    </div>
  )
}
