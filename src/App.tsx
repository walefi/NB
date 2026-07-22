import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { PublicBooking } from '@/pages/public-booking'
import { BookingConfirmation } from '@/pages/booking-confirmation'
import { AdminLoginPage } from '@/pages/admin-login'
import { AdminDashboard } from '@/pages/admin-dashboard'
import { AdminNotifications } from '@/pages/admin-notifications'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authed = localStorage.getItem('nb_admin_auth') === 'true'
  if (!authed) {
    return <Navigate to="/admin" replace />
  }
  return <>{children}</>
}

export default function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicBooking theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="/confirmacao" element={<BookingConfirmation theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="/admin" element={<AdminLoginPage theme={theme} onToggleTheme={toggleTheme} />} />
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
            <AdminDashboard theme={theme} onToggleTheme={toggleTheme} />
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
      </Routes>
    </BrowserRouter>
  )
}