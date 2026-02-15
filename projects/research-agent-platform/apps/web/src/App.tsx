import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import MainLayout from './components/Layout/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import Finance from './pages/Finance'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="finance" element={<Finance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
