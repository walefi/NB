import { useState, useCallback, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { DesktopHeader } from '@/components/admin/layout/DesktopHeader'
import { CalendarHeader } from '@/components/admin/calendar/CalendarHeader'
import { useCalendar } from '@/hooks/admin/useCalendar'
import { moveAppointment, deleteAppointment, updateAppointmentStatus } from '@/lib/firebase/appointments'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import type { ThemeMode, Appointment, AppointmentStatus } from '@/types'

const DayView = lazy(() =>
  import('@/components/admin/calendar/DayView').then((m) => ({ default: m.DayView }))
)
const WeekView = lazy(() =>
  import('@/components/admin/calendar/WeekView').then((m) => ({ default: m.WeekView }))
)
const MonthView = lazy(() =>
  import('@/components/admin/calendar/MonthView').then((m) => ({ default: m.MonthView }))
)
const AppointmentDrawer = lazy(() =>
  import('@/components/admin/calendar/AppointmentDrawer').then((m) => ({ default: m.AppointmentDrawer }))
)
const CreateAppointmentModal = lazy(() =>
  import('@/components/admin/calendar/CreateAppointmentModal').then((m) => ({ default: m.CreateAppointmentModal }))
)
const RescheduleModal = lazy(() =>
  import('@/components/admin/calendar/RescheduleModal').then((m) => ({ default: m.RescheduleModal }))
)

interface AdminCalendarProps {
  theme: ThemeMode
  onToggleTheme: () => void
}

export function AdminCalendar({ theme, onToggleTheme }: AdminCalendarProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const {
    appointments,
    allAppointments,
    settings,
    services,
    loading,
    view,
    currentDate,
    filters,
    weekDates,
    navigateToday,
    navigatePrev,
    navigateNext,
    setViewMode,
    updateFilters,
    setCurrentDate,
  } = useCalendar()

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createSlot, setCreateSlot] = useState<{ date: string; time: string } | null>(null)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/admin')
  }, [logout, navigate])

  const handleSelectAppointment = useCallback((apt: Appointment) => {
    setSelectedAppointment(apt)
    setDrawerOpen(true)
  }, [])

  const handleDragEnd = useCallback(
    async (apt: Appointment, newDate: string, newTime: string) => {
      if (apt.date === newDate && apt.time === newTime) return
      await moveAppointment(apt.id, newDate, newTime)
    },
    []
  )

  const handleCreateAtSlot = useCallback((date: string, time: string) => {
    setCreateSlot({ date, time })
    setCreateModalOpen(true)
  }, [])

  const handleCreated = useCallback(() => {
    setCreateModalOpen(false)
    setCreateSlot(null)
  }, [])

  const handleUpdateStatus = useCallback(
    async (id: string, status: AppointmentStatus) => {
      const apt = allAppointments.find((a) => a.id === id)
      if (apt) {
        await updateAppointmentStatus(id, status, {
          clientName: apt.clientName,
          clientPhone: apt.clientPhone,
          serviceName: apt.serviceName,
          date: apt.date,
          time: apt.time,
        })
        setDrawerOpen(false)
        setSelectedAppointment(null)
      }
    },
    [allAppointments]
  )

  const handleEdit = useCallback((_apt: Appointment) => {
    // Edit modal integration
    setDrawerOpen(false)
  }, [])

  const handleReschedule = useCallback((apt: Appointment) => {
    setRescheduleAppointment(apt)
    setDrawerOpen(false)
    setRescheduleOpen(true)
  }, [])

  const handleDelete = useCallback((id: string) => {
    setDeleteConfirmId(id)
    setDrawerOpen(false)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (deleteConfirmId) {
      await deleteAppointment(deleteConfirmId)
      setDeleteConfirmId(null)
      setSelectedAppointment(null)
    }
  }, [deleteConfirmId])

  const handleWhatsApp = useCallback((phone: string, _name: string) => {
    const clean = phone.replace(/\D/g, '')
    const formatted = clean.startsWith('55') ? clean : `55${clean}`
    window.open(`https://wa.me/${formatted}`, '_blank')
  }, [])

  const handleSelectDate = useCallback(
    (date: string) => {
      setCurrentDate(date)
      setViewMode('day')
    },
    [setCurrentDate, setViewMode]
  )

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <DesktopHeader theme={theme} onToggleTheme={onToggleTheme} onLogout={handleLogout} />

      <div className="lg:hidden">
        <AdminHeader theme={theme} onToggleTheme={onToggleTheme} onLogout={handleLogout} />
      </div>

      <AdminSidebar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="ml-0 lg:ml-64">
        <div className="h-screen flex flex-col">
          <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800">
            <CalendarHeader
              view={view}
              currentDate={currentDate}
              filters={filters}
              services={services}
              onPrev={navigatePrev}
              onNext={navigateNext}
              onToday={navigateToday}
              onViewChange={setViewMode}
              onFilterChange={updateFilters}
            />
          </div>

          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
                  </div>
                }
              >
                {view === 'day' && (
                  <DayView
                    date={currentDate}
                    appointments={appointments}
                    settings={settings}
                    onSelectAppointment={handleSelectAppointment}
                    onDragEnd={handleDragEnd}
                    onCreateAtSlot={handleCreateAtSlot}
                  />
                )}
                {view === 'week' && (
                  <WeekView
                    weekDates={weekDates}
                    appointments={appointments}
                    settings={settings}
                    onSelectAppointment={handleSelectAppointment}
                    onDragEnd={handleDragEnd}
                    onCreateAtSlot={handleCreateAtSlot}
                    onSelectDate={handleSelectDate}
                  />
                )}
                {view === 'month' && (
                  <MonthView
                    currentDate={currentDate}
                    appointments={appointments}
                    onSelectDate={handleSelectDate}
                    onSelectAppointment={handleSelectAppointment}
                  />
                )}
              </Suspense>
            )}
          </div>
        </div>
      </main>

      {drawerOpen && selectedAppointment && (
        <AppointmentDrawer
          appointment={selectedAppointment}
          onClose={() => { setDrawerOpen(false); setSelectedAppointment(null) }}
          onUpdateStatus={handleUpdateStatus}
          onEdit={handleEdit}
          onReschedule={handleReschedule}
          onDelete={handleDelete}
          onWhatsApp={handleWhatsApp}
        />
      )}

      {createModalOpen && createSlot && (
        <CreateAppointmentModal
          date={createSlot.date}
          time={createSlot.time}
          services={services}
          onClose={() => { setCreateModalOpen(false); setCreateSlot(null) }}
          onCreated={handleCreated}
        />
      )}

      {rescheduleOpen && rescheduleAppointment && (
        <RescheduleModal
          appointment={rescheduleAppointment}
          settings={settings}
          allAppointments={allAppointments}
          onClose={() => { setRescheduleOpen(false); setRescheduleAppointment(null) }}
          onRescheduled={() => { setRescheduleOpen(false); setRescheduleAppointment(null) }}
        />
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black rounded-3xl border-2 border-rose-100 dark:border-rose-dark/20 max-w-sm w-full p-6">
            <h3 className="font-serif text-lg font-semibold text-black dark:text-white mb-4">
              Excluir agendamento?
            </h3>
            <p className="text-sm text-black/50 dark:text-white/50 mb-6">
              Esta acao nao pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="flex-1">
                Cancelar
              </Button>
              <Button
                variant="ghost"
                onClick={confirmDelete}
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
