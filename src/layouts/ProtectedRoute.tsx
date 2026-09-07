import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function ProtectedRoute() {
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  return <Outlet />
}
