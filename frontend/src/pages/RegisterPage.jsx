import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const { register, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    try {
      await register({ full_name: form.full_name, email: form.email, password: form.password })
      toast.success('Account created! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md fade-in">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-orange-500 p-3 rounded-xl mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-gray-800">Join EduNexus Today</h1>
            <p className="text-gray-500 mt-1 text-sm">Create your free learning account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required minLength={2}
              />
            </div>
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
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required minLength={8}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-700 font-semibold hover:text-blue-900">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
