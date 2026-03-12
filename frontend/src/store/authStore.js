import { create } from 'zustand'
import { authAPI } from '../services/api'

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authAPI.login({ email, password })
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token: data.access_token, loading: false })
      return data
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed'
      set({ error: msg, loading: false })
      throw new Error(msg)
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authAPI.register(userData)
      set({ loading: false })
      return data
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed'
      set({ error: msg, loading: false })
      throw new Error(msg)
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  refreshUser: async () => {
    try {
      const { data } = await authAPI.me()
      localStorage.setItem('user', JSON.stringify(data))
      set({ user: data })
    } catch {}
  },

  isAdmin: () => get().user?.is_admin === true,
  isLoggedIn: () => !!get().token,
}))

export default useAuthStore
