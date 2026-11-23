import { Navigate, Route, Routes } from 'react-router-dom'
import { homeFor, useAuth } from './auth/auth'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="intern" />}>
        <Route element={<Layout />}>
          <Route path="/my-dashboard" element={<Dashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={user ? homeFor(user) : '/login'} replace />} />
    </Routes>
  )
}
