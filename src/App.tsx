import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/hooks/useTheme'
import { PublicBooking } from '@/pages/public-booking'
import { BookingConfirmation } from '@/pages/booking-confirmation'
import { AdminLoginPage } from '@/pages/admin-login'
import { AdminDashboard } from '@/pages/admin-dashboard'
import { AdminNotifications } from '@/pages/admin-notifications'
import { AdminSettings } from '@/pages/admin-settings'
import { AdminCalendar } from '@/pages/admin-calendar'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (currentUser) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Routes>
      <Route path="/" element={<PublicBooking theme={theme} onToggleTheme={toggleTheme} />} />
      <Route path="/confirmacao" element={<BookingConfirmation theme={theme} onToggleTheme={toggleTheme} />} />
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLoginPage theme={theme} onToggleTheme={toggleTheme} />
        </AdminRoute>
      } />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute>
          <AdminDashboard theme={theme} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />
      <Route path="/admin/appointments" element={
        <ProtectedRoute>
          <AdminDashboard theme={theme} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />
      <Route path="/admin/calendar" element={
        <ProtectedRoute>
          <AdminCalendar theme={theme} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />
      <Route path="/admin/stats" element={
        <ProtectedRoute>
          <AdminDashboard theme={theme} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute>
          <AdminNotifications theme={theme} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute>
          <AdminSettings theme={theme} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
