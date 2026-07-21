import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { onAuthStateChanged } from 'firebase/auth'
import { Header } from '@/components/shared/Header'
import { Button } from '@/components/ui/Button'
import { StatsCards } from '@/components/admin/StatsCards'
import { AppointmentFilters } from '@/components/admin/AppointmentFilters'
import { AppointmentList } from '@/components/admin/AppointmentList'
import { useAppointments } from '@/hooks/useAppointments'
import { auth, firebaseReady } from '@/lib/firebase/config'
import { signOut } from 'firebase/auth'
import type { ThemeMode, AppointmentStatus } from '@/types'

interface AdminDashboardProps {
  theme: ThemeMode
  onToggleTheme: () => void
}

export function AdminDashboard({ theme, onToggleTheme }: AdminDashboardProps) {
  const navigate = useNavigate()
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all')
  const { appointments, loading, updateStatus } = useAppointments(dateFilter || undefined)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (firebaseReady && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          localStorage.removeItem('nb_admin_auth')
          navigate('/admin')
        } else {
          setAuthChecked(true)
        }
      })
      return () => unsubscribe()
    } else {
      const authed = localStorage.getItem('nb_admin_auth')
      if (!authed) {
        navigate('/admin')
      } else {
        setAuthChecked(true)
      }
    }
  }, [navigate])

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-pulse text-rose dark:text-rose-light text-sm">
          Verificando autenticacao...
        </div>
      </div>
    )
  }

  const filtered = appointments.filter((a) =>
    statusFilter === 'all' ? true : a.status === statusFilter
  )

  const handleLogout = async () => {
    localStorage.removeItem('nb_admin_auth')
    if (firebaseReady && auth) {
      try {
        await signOut(auth)
      } catch {
        // ignore
      }
    }
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header theme={theme} onToggleTheme={onToggleTheme} hideBooking />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-black dark:text-white">
              Painel
            </h1>
            <p className="text-sm text-black/50 dark:text-white/50 mt-1">
              Gerencie seus agendamentos
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        <StatsCards appointments={appointments} />

        <div className="mt-10">
          <h2 className="font-serif text-xl font-semibold text-black dark:text-white mb-4">
            Agendamentos
          </h2>
          <AppointmentFilters
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
          <AppointmentList
            appointments={filtered}
            loading={loading}
            onUpdateStatus={updateStatus}
          />
        </div>
      </div>
    </div>
  )
}
