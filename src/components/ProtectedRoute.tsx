import { Navigate, Outlet } from 'react-router-dom'
import { homeFor, useAuth } from '../auth/auth'
import type { Role } from '../types'

// Sends logged-out users to /login and users with the wrong role to their own home page
export default function ProtectedRoute({ role }: { role: Role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={homeFor(user)} replace />
  return <Outlet />
}
