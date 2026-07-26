import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, User, Phone, Calendar as CalendarIcon } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { DesktopHeader } from '@/components/admin/layout/DesktopHeader'
import { useAppointmentsAdmin } from '@/hooks/admin/useAppointmentsAdmin'
import { useAuth } from '@/contexts/AuthContext'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { fetchServices } from '@/lib/firebase/services'
import { formatBookingDate, formatPrice } from '@/lib/utils'
import { formatTimeRange } from '@/lib/calendar/utils'
import { APPOINTMENT_STATUS } from '@/constants/appointment-status'
import { Card } from '@/components/ui/Card'
import type { ThemeMode, Service } from '@/types'

interface AdminHistoryProps {
  theme: ThemeMode
  onToggleTheme: () => void
}

export function AdminHistory({ theme, onToggleTheme }: AdminHistoryProps) {
  useScrollToTop()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    fetchServices().then(setServices).catch(() => {})
  }, [])

  const { appointments, loading } = useAppointmentsAdmin({
    statusFilter: APPOINTMENT_STATUS.COMPLETED,
    searchQuery,
    serviceFilter,
  })

  const filteredByDate = appointments.filter((apt) => {
    if (monthFilter) {
      const aptMonth = apt.date.slice(5, 7)
      if (aptMonth !== monthFilter) return false
    }
    if (yearFilter) {
      const aptYear = apt.date.slice(0, 4)
      if (aptYear !== yearFilter) return false
    }
    return true
  })

  const totalRevenue = filteredByDate.reduce((sum, a) => sum + a.servicePrice, 0)

  const handleLogout = async () => {
    await logout()
    navigate('/admin')
  }

  const months = [
    { value: '', label: 'Todos os meses' },
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Marco' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ]

  const years = ['', ...new Set(appointments.map((a) => a.date.slice(0, 4)))].sort().reverse()

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <DesktopHeader theme={theme} onToggleTheme={onToggleTheme} onLogout={handleLogout} />

      <div className="lg:hidden">
        <AdminHeader theme={theme} onToggleTheme={onToggleTheme} onLogout={handleLogout} />
      </div>

      <AdminSidebar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="ml-0 lg:ml-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-black dark:text-white">
              Historico
            </h1>
            <p className="text-sm text-black/50 dark:text-white/50 mt-1">
              Atendimentos concluidos
            </p>
          </div>

          <Card className="p-4 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou telefone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-rose-100 dark:border-rose-dark/30 bg-white dark:bg-black text-black dark:text-white text-sm focus:border-rose dark:focus:border-rose-light outline-none"
                />
              </div>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border-2 border-rose-100 dark:border-rose-dark/30 bg-white dark:bg-black text-black dark:text-white text-sm focus:border-rose dark:focus:border-rose-light outline-none appearance-none"
              >
                <option value="">Todos servicos</option>
                {services.filter((s) => s.isActive).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border-2 border-rose-100 dark:border-rose-dark/30 bg-white dark:bg-black text-black dark:text-white text-sm focus:border-rose dark:focus:border-rose-light outline-none appearance-none"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border-2 border-rose-100 dark:border-rose-dark/30 bg-white dark:bg-black text-black dark:text-white text-sm focus:border-rose dark:focus:border-rose-light outline-none appearance-none"
              >
                <option value="">Todos os anos</option>
                {years.filter(Boolean).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </Card>

          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-black/50 dark:text-white/50">
                {filteredByDate.length} atendimento{filteredByDate.length !== 1 ? 's' : ''}
              </span>
              <span className="text-lg font-bold text-black dark:text-white">
                {formatPrice(totalRevenue)}
              </span>
            </div>
          </Card>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl border-2 border-rose-100 dark:border-rose-dark/20 p-6 animate-pulse">
                  <div className="h-5 bg-rose-100 dark:bg-rose-dark/20 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-rose-50 dark:bg-rose-dark/10 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredByDate.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-dark/20 flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-rose dark:text-rose-light" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-black dark:text-white mb-2">
                Nenhum historico
              </h3>
              <p className="text-sm text-black/50 dark:text-white/50">
                Nenhum atendimento concluido encontrado.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredByDate.map((apt) => (
                <Card key={apt.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-black dark:text-white">
                          {apt.clientName}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-black/50 dark:text-white/50 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {apt.clientPhone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeRange(apt.time, apt.serviceDuration)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-auto">
                      <span className="text-sm text-black/50 dark:text-white/50">
                        {formatBookingDate(apt.date)}
                      </span>
                      <span className="text-sm font-semibold text-black dark:text-white">
                        {formatPrice(apt.servicePrice)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
