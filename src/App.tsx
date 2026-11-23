import { Navigate, Route, Routes } from 'react-router-dom'
import { homeFor, useAuth } from './auth/auth'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Interns from './pages/Interns'
import Login from './pages/Login'
import MyTasks from './pages/MyTasks'
import Tasks from './pages/Tasks'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interns" element={<Interns />} />
          <Route path="/tasks" element={<Tasks />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="intern" />}>
        <Route element={<Layout />}>
          <Route path="/my-dashboard" element={<Dashboard />} />
          <Route path="/my-tasks" element={<MyTasks />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={user ? homeFor(user) : '/login'} replace />} />
    </Routes>
  )
}
