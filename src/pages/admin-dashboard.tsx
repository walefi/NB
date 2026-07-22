import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { DesktopHeader } from '@/components/admin/layout/DesktopHeader'
import { StatsCards } from '@/components/admin/dashboard/StatsCards'
import { AppointmentFilters } from '@/components/admin/filters/AppointmentFilters'
import { AppointmentList } from '@/components/admin/appointments/AppointmentList'
import { RescheduleModal } from '@/components/admin/modals/RescheduleModal'
import { EditModal } from '@/components/admin/modals/EditModal'
import { useAppointmentsAdmin } from '@/hooks/admin/useAppointmentsAdmin'
import { useNotifications } from '@/hooks/admin/useNotifications'
import { updateAppointmentStatus } from '@/lib/firebase/appointments'
import { useAuth } from '@/contexts/AuthContext'
import type { ThemeMode, Appointment, AppointmentStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface AdminDashboardProps {
  theme: ThemeMode
  onToggleTheme: () => void
}

export function AdminDashboard({ theme, onToggleTheme }: AdminDashboardProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const { appointments, loading } = useAppointmentsAdmin({
    dateFilter: dateFilter || undefined,
    statusFilter,
    searchQuery,
  })

  const { unreadCount, todayNotifications } = useNotifications()

  const handleLogout = async () => {
    await logout()
    navigate('/admin')
  }

  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
    const apt = appointments.find(a => a.id === id)
    if (apt) {
      await updateAppointmentStatus(id, status, {
        clientName: apt.clientName,
        clientPhone: apt.clientPhone,
        serviceName: apt.serviceName,
        date: apt.date,
        time: apt.time,
      })
    }
  }

  const handleDelete = () => {
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    setDeleteConfirmOpen(false)
  }

  const cancelDelete = () => {
    setDeleteConfirmOpen(false)
  }

  const handleUpdate = async (id: string, data: Partial<Appointment>) => {
    const apt = appointments.find(a => a.id === id)
    if (apt && data.status) {
      await updateAppointmentStatus(id, data.status, {
        clientName: apt.clientName,
        clientPhone: apt.clientPhone,
        serviceName: apt.serviceName,
        date: data.date ?? apt.date,
        time: data.time ?? apt.time,
      })
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <DesktopHeader theme={theme} onToggleTheme={onToggleTheme} onLogout={handleLogout} />

      <div className="lg:hidden">
        <AdminHeader theme={theme} onToggleTheme={onToggleTheme} onLogout={handleLogout} />
      </div>

      <AdminSidebar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="ml-0 lg:ml-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl font-bold text-black dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm text-black/50 dark:text-white/50 mt-1">
                Gerencie seus agendamentos
              </p>
            </div>
          </div>

          <StatsCards appointments={appointments} />

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
            <Card className="flex items-start gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-dark/20 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-rose dark:text-rose-light" />
              </div>
              <div>
                <p className="text-xs text-black/50 dark:text-white/50 mb-1">Notificacoes Hoje</p>
                <p className="font-bold text-black dark:text-white text-xl">{todayNotifications.length}</p>
              </div>
            </Card>
            <Card className="flex items-start gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-pink-light dark:bg-pink-dark/20 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-rose dark:text-rose-light" />
              </div>
              <div>
                <p className="text-xs text-black/50 dark:text-white/50 mb-1">Nao Lidas</p>
                <p className="font-bold text-black dark:text-white text-xl">{unreadCount}</p>
              </div>
            </Card>
          </div>

          <div className="mt-10">
            <h2 className="font-serif text-xl font-semibold text-black dark:text-white mb-4">
              Agendamentos
            </h2>
            <AppointmentFilters
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <AppointmentList
              appointments={appointments}
              loading={loading}
              onUpdateStatus={handleUpdateStatus}
              onConfirm={(id) => handleUpdateStatus(id, 'confirmed')}
              onCancel={(id) => handleUpdateStatus(id, 'cancelled')}
              onComplete={(id) => handleUpdateStatus(id, 'completed')}
              onNoShow={(id) => handleUpdateStatus(id, 'no_show')}
              onEdit={(id) => {
                const apt = appointments.find(a => a.id === id)
                if (apt) {
                  setSelectedAppointment(apt)
                  setEditModalOpen(true)
                }
              }}
              onReschedule={(id) => {
                const apt = appointments.find(a => a.id === id)
                if (apt) {
                  setSelectedAppointment(apt)
                  setRescheduleModalOpen(true)
                }
              }}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>

      {editModalOpen && selectedAppointment && (
        <EditModal
          appointment={selectedAppointment}
          onClose={() => setEditModalOpen(false)}
          onUpdate={handleUpdate}
        />
      )}

      {rescheduleModalOpen && selectedAppointment && (
        <RescheduleModal
          appointment={selectedAppointment}
          onClose={() => setRescheduleModalOpen(false)}
          onReschedule={(id, date, time) => {
            handleUpdate(id, { date, time } as Partial<Appointment>)
          }}
        />
      )}

      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black rounded-3xl border-2 border-rose-100 dark:border-rose-dark/20 max-w-sm w-full p-6">
            <h3 className="font-serif text-lg font-semibold text-black dark:text-white mb-4">
              Excluir agendamento?
            </h3>
            <p className="text-sm text-black/50 dark:text-white/50 mb-6">
              Esta acao nao pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={cancelDelete} className="flex-1">
                Cancelar
              </Button>
              <Button variant="ghost" onClick={confirmDelete} className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}