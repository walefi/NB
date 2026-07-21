import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { PublicBooking } from '@/pages/public-booking'
import { BookingConfirmation } from '@/pages/booking-confirmation'
import { AdminLogin } from '@/pages/admin-login'
import { AdminDashboard } from '@/pages/admin-dashboard'

export default function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<PublicBooking theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/confirmacao"
          element={<BookingConfirmation theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/admin"
          element={<AdminLogin theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard theme={theme} onToggleTheme={toggleTheme} />}
        />
      </Routes>
    </BrowserRouter>
  )
}
