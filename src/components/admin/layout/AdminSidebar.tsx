import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Calendar as CalendarIcon, Home, BarChart3, LogOut, Bell } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { ThemeMode } from '@/types'

interface AdminSidebarProps {
  theme: ThemeMode
  onToggleTheme: () => void
}

export function AdminSidebar(_props: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('nb_admin_auth')
    navigate('/admin')
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/appointments', label: 'Agendamentos', icon: CalendarIcon },
    { href: '/admin/notifications', label: 'Notificacoes', icon: Bell },
    { href: '/admin/calendar', label: 'Calendario', icon: CalendarIcon },
    { href: '/admin/stats', label: 'Estatisticas', icon: BarChart3 },
  ]

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-rose text-white flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside className="hidden lg:block w-64 h-screen bg-white dark:bg-black border-r border-rose-100 dark:border-rose-dark/20">
        <div className="p-6">
          <Link to="/admin/dashboard" className="font-serif text-2xl font-bold text-rose dark:text-rose-light flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" />
            NB Nail
          </Link>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-black dark:text-white hover:bg-rose-50 dark:hover:bg-rose-dark/10 transition-colors"
            >
              <item.icon className="w-4 h-4 text-rose dark:text-rose-light" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50 dark:bg-black/80" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-black border-r border-rose-100 dark:border-rose-dark/20 z-50">
            <div className="p-6">
              <button
                onClick={() => setMobileOpen(false)}
                className="ml-auto w-8 h-8 rounded-xl bg-rose text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
              <Link to="/admin/dashboard" className="font-serif text-2xl font-bold text-rose dark:text-rose-light flex items-center gap-2 mt-4">
                <CalendarIcon className="w-6 h-6" />
                NB Nail
              </Link>
            </div>

            <nav className="px-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-black dark:text-white hover:bg-rose-50 dark:hover:bg-rose-dark/10 transition-colors"
                >
                  <item.icon className="w-4 h-4 text-rose dark:text-rose-light" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="p-4">
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}