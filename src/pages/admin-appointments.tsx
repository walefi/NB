import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, User, Phone, CreditCard, FileText, Calendar as CalendarIcon, Check, Trash2, Edit, MessageCircle, X } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { DesktopHeader } from '@/components/admin/layout/DesktopHeader'
import { AppointmentFilters } from '@/components/admin/filters/AppointmentFilters'
import { useAppointmentsAdmin } from '@/hooks/admin/useAppointmentsAdmin'
import { useAuth } from '@/contexts/AuthContext'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { fetchServices } from '@/lib/firebase/services'
import { updateAppointmentStatus, rescheduleAppointment, deleteAppointment } from '@/lib/firebase/appointments'
import { buildWhatsAppUrl, buildAppointmentMessage } from '@/lib/admin/whatsapp'
import { formatBookingDate, formatPrice } from '@/lib/utils'
import { formatTimeRange } from '@/lib/calendar/utils'
import { STATUS_LABELS, PAYMENT_LABELS } from '@/constants'
import { APPOINTMENT_STATUS, type AppointmentStatus } from '@/constants/appointment-status'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { ThemeMode, Appointment, Service } from '@/types'

interface AdminAppointmentsProps {
  theme: ThemeMode
  onToggleTheme: () => void
}

export function AdminAppointments({ theme, onToggleTheme }: AdminAppointmentsProps) {
  useScrollToTop()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [services, setServices] = useState<Service[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    fetchServices().then(setServices).catch(() => {})
  }, [])

  const { appointments, loading } = useAppointmentsAdmin({
    dateFilter: dateFilter || undefined,
    statusFilter,
    searchQuery,
    serviceFilter,
  })

  const handleLogout = async () => {
    await logout()
    navigate('/admin')
  }

  const handleComplete = useCallback(async (id: string) => {
    const apt = appointments.find((a) => a.id === id)
    if (apt) {
      await updateAppointmentStatus(id, APPOINTMENT_STATUS.COMPLETED, {
        clientName: apt.clientName,
        clientPhone: apt.clientPhone,
        serviceName: apt.serviceName,
        date: apt.date,
        time: apt.time,
      })
    }
  }, [appointments])

  const handleCancel = useCallback(async (id: string) => {
    const apt = appointments.find((a) => a.id === id)
    if (apt) {
      await updateAppointmentStatus(id, APPOINTMENT_STATUS.CANCELLED, {
        clientName: apt.clientName,
        clientPhone: apt.clientPhone,
        serviceName: apt.serviceName,
        date: apt.date,
        time: apt.time,
      })
    }
  }, [appointments])

  const handleDelete = useCallback(async () => {
    if (deleteConfirmId) {
      await deleteAppointment(deleteConfirmId)
      setDeleteConfirmId(null)
    }
  }, [deleteConfirmId])

  const handleReschedule = useCallback(async () => {
    if (rescheduleId && rescheduleDate && rescheduleTime) {
      const apt = appointments.find((a) => a.id === rescheduleId)
      await rescheduleAppointment(rescheduleId, rescheduleDate, rescheduleTime, apt ? {
        clientName: apt.clientName,
        clientPhone: apt.clientPhone,
        serviceName: apt.serviceName,
        date: apt.date,
        time: apt.time,
        serviceDuration: apt.serviceDuration,
      } : undefined)
      setRescheduleId(null)
      setRescheduleDate('')
      setRescheduleTime('')
    }
  }, [rescheduleId, rescheduleDate, rescheduleTime, appointments])

  const handleWhatsApp = useCallback((apt: Appointment) => {
    const message = buildAppointmentMessage(apt)
    const url = buildWhatsAppUrl(apt.clientPhone, message)
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    cancelled: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    no_show: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
    deleted: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  }

  const TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00',
  ]

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
              Agendamentos
            </h1>
            <p className="text-sm text-black/50 dark:text-white/50 mt-1">
              Todos os agendamentos em tempo real
            </p>
          </div>

          <AppointmentFilters
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            serviceFilter={serviceFilter}
            onServiceFilterChange={setServiceFilter}
            services={services}
          />

          {loading ? (
            <div className="space-y-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl border-2 border-rose-100 dark:border-rose-dark/20 p-6 animate-pulse">
                  <div className="h-5 bg-rose-100 dark:bg-rose-dark/20 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-rose-50 dark:bg-rose-dark/10 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-dark/20 flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-rose dark:text-rose-light" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-black dark:text-white mb-2">
                Nenhum agendamento
              </h3>
              <p className="text-sm text-black/50 dark:text-white/50">
                Nenhum agendamento encontrado para este periodo.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mt-6">
              {appointments.map((apt) => {
                const isExpanded = expandedId === apt.id
                return (
                  <Card key={apt.id} className="overflow-hidden">
                    <div
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : apt.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-dark/20 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-rose dark:text-rose-light" />
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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[apt.status]}`}>
                          {STATUS_LABELS[apt.status]}
                        </span>
                        <span className="text-sm font-semibold text-black dark:text-white">
                          {formatPrice(apt.servicePrice)}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-rose-100 dark:border-rose-dark/20 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm mb-4">
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                            <User className="w-4 h-4 text-rose shrink-0" />
                            <div>
                              <p className="text-xs text-black/50 dark:text-white/50">Cliente</p>
                              <p className="font-medium text-black dark:text-white">{apt.clientName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                            <Phone className="w-4 h-4 text-rose shrink-0" />
                            <div>
                              <p className="text-xs text-black/50 dark:text-white/50">Telefone</p>
                              <p className="font-medium text-black dark:text-white">{apt.clientPhone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                            <CalendarIcon className="w-4 h-4 text-rose shrink-0" />
                            <div>
                              <p className="text-xs text-black/50 dark:text-white/50">Servico</p>
                              <p className="font-medium text-black dark:text-white">{apt.serviceName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                            <CreditCard className="w-4 h-4 text-rose shrink-0" />
                            <div>
                              <p className="text-xs text-black/50 dark:text-white/50">Valor</p>
                              <p className="font-medium text-black dark:text-white">{formatPrice(apt.servicePrice)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                            <CalendarIcon className="w-4 h-4 text-rose shrink-0" />
                            <div>
                              <p className="text-xs text-black/50 dark:text-white/50">Data</p>
                              <p className="font-medium text-black dark:text-white">{formatBookingDate(apt.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                            <Clock className="w-4 h-4 text-rose shrink-0" />
                            <div>
                              <p className="text-xs text-black/50 dark:text-white/50">Horario</p>
                              <p className="font-medium text-black dark:text-white">{formatTimeRange(apt.time, apt.serviceDuration)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                            <CreditCard className="w-4 h-4 text-rose shrink-0" />
                            <div>
                              <p className="text-xs text-black/50 dark:text-white/50">Pagamento</p>
                              <p className="font-medium text-black dark:text-white">
                                {PAYMENT_LABELS[apt.paymentMethod] || apt.paymentMethod}
                              </p>
                            </div>
                          </div>
                          {apt.notes && (
                            <div className="sm:col-span-2 lg:col-span-3 flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                              <FileText className="w-4 h-4 text-rose shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-black/50 dark:text-white/50">Observacoes</p>
                                <p className="font-medium text-black dark:text-white">{apt.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-3 border-t border-rose-100 dark:border-rose-dark/20">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleWhatsApp(apt) }}
                            className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Conversar
                          </Button>
                          {apt.status === APPOINTMENT_STATUS.CONFIRMED && (
                            <>
                              <Button
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleComplete(apt.id); setExpandedId(null) }}
                                className="flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Concluir
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); setRescheduleId(apt.id); setRescheduleDate(apt.date); setRescheduleTime(apt.time) }}
                                className="flex items-center gap-1"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Reagendar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); handleCancel(apt.id); setExpandedId(null) }}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <X className="w-3.5 h-3.5" />
                                Cancelar
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(apt.id) }}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {rescheduleId && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black rounded-3xl border-2 border-rose-100 dark:border-rose-dark/20 max-w-lg w-full p-6 animate-fade-in">
            <h3 className="font-serif text-lg font-semibold text-black dark:text-white mb-4">
              Reagendar Agendamento
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-black dark:text-white mb-2">Nova Data</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-rose-100 dark:border-rose-dark/30 bg-white dark:bg-black text-black dark:text-white text-sm focus:border-rose dark:focus:border-rose-light outline-none"
                />
              </div>
              {rescheduleDate && (
                <div>
                  <label className="text-xs font-medium text-black dark:text-white mb-2">Novo Horario</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setRescheduleTime(t)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          rescheduleTime === t
                            ? 'bg-rose text-white'
                            : 'bg-rose-50 dark:bg-rose-dark/10 text-rose dark:text-rose-light hover:bg-rose-100 dark:hover:bg-rose-dark/20'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => { setRescheduleId(null); setRescheduleDate(''); setRescheduleTime('') }} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleReschedule} disabled={!rescheduleDate || !rescheduleTime} className="flex-1">
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black rounded-3xl border-2 border-rose-100 dark:border-rose-dark/20 max-w-sm w-full p-6">
            <h3 className="font-serif text-lg font-semibold text-black dark:text-white mb-4">
              Excluir agendamento?
            </h3>
            <p className="text-sm text-black/50 dark:text-white/50 mb-6">
              O agendamento sera marcado como excluido.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="ghost" onClick={handleDelete} className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
