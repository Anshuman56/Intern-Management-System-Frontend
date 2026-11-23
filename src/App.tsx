import { Navigate, Route, Routes } from 'react-router-dom'
import { homeFor, useAuth } from './auth/auth'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'

function Placeholder({ title }: { title: string }) {
  return <h1 className="text-2xl font-semibold">{title}</h1>
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Placeholder title="Admin Dashboard" />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="intern" />}>
        <Route element={<Layout />}>
          <Route path="/my-dashboard" element={<Placeholder title="My Dashboard" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={user ? homeFor(user) : '/login'} replace />} />
    </Routes>
  )
}
