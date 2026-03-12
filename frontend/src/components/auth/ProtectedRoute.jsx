import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuthStore()
  return isLoggedIn() ? children : <Navigate to="/login" replace />
}

export function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuthStore()
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  if (!isAdmin()) return <Navigate to="/dashboard" replace />
  return children
}
