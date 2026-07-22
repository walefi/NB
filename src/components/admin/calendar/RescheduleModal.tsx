import { memo, useState, useMemo, useCallback } from 'react'
import { X, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { rescheduleAppointment } from '@/lib/firebase/appointments'
import {
  generateTimeSlots,
  getDaySchedule,
  isDateBlocked,
  isBreakTime,
  isTimeBlocked,
  getAppointmentsForSlot,
  formatDate,
} from '@/lib/calendar/utils'
import type { Appointment, BusinessSettings } from '@/types'

interface Props {
  appointment: Appointment
  settings: BusinessSettings | null
  allAppointments: Appointment[]
  onClose: () => void
  onRescheduled: () => void
}

export const RescheduleModal = memo(function RescheduleModal({
  appointment,
  settings,
  allAppointments,
  onClose,
  onRescheduled,
}: Props) {
  const [newDate, setNewDate] = useState(appointment.date)
  const [newTime, setNewTime] = useState(appointment.time)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const timeSlots = useMemo(() => generateTimeSlots(8, 20), [])

  const availableSlots = useMemo(() => {
    if (isDateBlocked(newDate, settings)) return []
    const schedule = getDaySchedule(newDate, settings)
    if (!schedule.open) return []

    return timeSlots.filter((slot) => {
      if (slot < schedule.startTime || slot >= schedule.endTime) return false
      if (isBreakTime(slot, settings?.breaks || [])) return false
      if (isTimeBlocked(newDate, slot, settings)) return false

      const slotAppts = getAppointmentsForSlot(newDate, slot, allAppointments)
      if (slotAppts.length > 0) return false

      return true
    })
  }, [newDate, settings, timeSlots, allAppointments])

  const handleSubmit = useCallback(async () => {
    if (!newDate || !newTime) {
      setError('Selecione uma data e horario.')
      return
    }

    if (newDate === appointment.date && newTime === appointment.time) {
      setError('O novo horario deve ser diferente do atual.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await rescheduleAppointment(appointment.id, newDate, newTime, {
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        serviceName: appointment.serviceName,
        date: appointment.date,
        time: appointment.time,
      })
      onRescheduled()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reagendar.')
    } finally {
      setLoading(false)
    }
  }, [newDate, newTime, appointment, onRescheduled])

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/80 z-40"
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Fechar"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-black rounded-3xl border-2 border-rose-100 dark:border-rose-dark/20 max-w-md w-full shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-rose-100 dark:border-rose-dark/20">
            <h2 className="text-xl font-bold text-black dark:text-white">
              Reagendar
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Agendamento atual</p>
              <p className="text-sm font-medium text-black dark:text-white">
                {appointment.clientName} - {formatDate(appointment.date)} as {appointment.time}
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white mb-1">
                <Calendar className="w-4 h-4 text-rose" />
                Nova Data
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => { setNewDate(e.target.value); setNewTime('') }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white mb-1">
                <Clock className="w-4 h-4 text-rose" />
                Novo Horario
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setNewTime(slot)}
                    className={`px-2 py-1.5 text-sm rounded-lg border transition-colors ${
                      newTime === slot
                        ? 'bg-rose text-white border-rose'
                        : 'border-rose-200 dark:border-rose-dark/30 text-black dark:text-white hover:bg-rose-50 dark:hover:bg-rose-dark/10'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
                {availableSlots.length === 0 && (
                  <p className="col-span-4 text-sm text-gray-400 text-center py-4">
                    Nenhum horario disponivel
                  </p>
                )}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={!newDate || !newTime}
                className="flex-1"
              >
                Reagendar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
})
