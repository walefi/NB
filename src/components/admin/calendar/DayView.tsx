import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { AppointmentCard } from './AppointmentCard'
import {
  generateTimeSlots,
  getDaySchedule,
  isDateBlocked,
  isBreakTime,
  isTimeBlocked,
  getAppointmentsForSlot,
  isToday,
} from '@/lib/calendar/utils'
import type { Appointment, BusinessSettings } from '@/types'

interface Props {
  date: string
  appointments: Appointment[]
  settings: BusinessSettings | null
  onSelectAppointment: (apt: Appointment) => void
  onDragEnd: (apt: Appointment, newDate: string, newTime: string) => void
  onCreateAtSlot: (date: string, time: string) => void
}

const SLOT_HEIGHT = 48

export const DayView = memo(function DayView({
  date,
  appointments,
  settings,
  onSelectAppointment,
  onDragEnd,
  onCreateAtSlot,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragOverTime, setDragOverTime] = useState<string | null>(null)
  const timeSlots = useMemo(() => generateTimeSlots(8, 20), [])
  const schedule = useMemo(() => getDaySchedule(date, settings), [date, settings])
  const dateBlocked = useMemo(() => isDateBlocked(date, settings), [date, settings])

  const handleDragStart = useCallback((_e: React.DragEvent, _apt: Appointment) => {
    // dataTransfer is set in the card
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, slotTime: string) => {
      e.preventDefault()
      setDragOverTime(null)
      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'))
        if (data.appointmentId) {
          onDragEnd(
            { id: data.appointmentId, date: data.date, time: data.time } as Appointment,
            date,
            slotTime
          )
        }
      } catch { /* */ }
    },
    [date, onDragEnd]
  )

  const handleDragOver = useCallback((e: React.DragEvent, slotTime: string) => {
    e.preventDefault()
    setDragOverTime(slotTime)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverTime(null)
  }, [])

  const handleSlotClick = useCallback(
    (slotTime: string) => {
      if (dateBlocked) return
      if (!schedule.open) return
      if (slotTime < schedule.startTime || slotTime >= schedule.endTime) return
      if (isBreakTime(slotTime, settings?.breaks || [])) return
      if (isTimeBlocked(date, slotTime, settings)) return

      const slotAppts = getAppointmentsForSlot(date, slotTime, appointments)
      if (slotAppts.length === 0) {
        onCreateAtSlot(date, slotTime)
      }
    },
    [date, dateBlocked, schedule, settings, appointments, onCreateAtSlot]
  )

  return (
    <div className="flex flex-col h-full">
      {dateBlocked && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4 text-center">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            Dia bloqueado
          </p>
        </div>
      )}

      {!schedule.open && !dateBlocked && (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Estudio fechado neste dia
          </p>
        </div>
      )}

      <div ref={containerRef} className="relative overflow-y-auto flex-1">
        {timeSlots.map((slotTime) => {
          const slotAppts = getAppointmentsForSlot(date, slotTime, appointments)
          const isBreak = isBreakTime(slotTime, settings?.breaks || [])
          const isBlocked = isTimeBlocked(date, slotTime, settings)
          const isOutside =
            !schedule.open || slotTime < schedule.startTime || slotTime >= schedule.endTime
          const isCurrentSlot = isToday(date) && slotTime <= new Date().toTimeString().slice(0, 5)
          const isDropTarget = dragOverTime === slotTime

          return (
            <div
              key={slotTime}
              className={`relative flex border-b border-gray-100 dark:border-gray-800
                ${isDropTarget ? 'bg-rose-50 dark:bg-rose-dark/10' : ''}
                ${isBreak ? 'bg-gray-50 dark:bg-gray-900/50' : ''}
                ${isBlocked ? 'bg-red-50/50 dark:bg-red-900/10' : ''}
                ${isOutside ? 'bg-gray-50/50 dark:bg-gray-900/30' : ''}
                ${isCurrentSlot ? 'bg-rose-50/30 dark:bg-rose-dark/5' : ''}
                hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors`}
              style={{ minHeight: `${SLOT_HEIGHT}px` }}
              onDragOver={(e) => handleDragOver(e, slotTime)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, slotTime)}
              onClick={() => handleSlotClick(slotTime)}
              role="gridcell"
              aria-label={`Horario ${slotTime}`}
            >
              <div className="w-16 sm:w-20 shrink-0 py-2 px-2 sm:px-3 text-right">
                <span className={`text-xs font-mono ${
                  isCurrentSlot
                    ? 'text-rose font-bold'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {slotTime}
                </span>
              </div>

              <div className="relative flex-1 py-1">
                {isBreak && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                      Intervalo
                    </span>
                  </div>
                )}
                {isBlocked && !isBreak && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-red-400 dark:text-red-500 italic">
                      Bloqueado
                    </span>
                  </div>
                )}
                {slotAppts.length > 0 && (
                  <div className="relative h-full">
                    {slotAppts.map((apt) => (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        slotHeight={SLOT_HEIGHT}
                        onClick={onSelectAppointment}
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            'application/json',
                            JSON.stringify({
                              appointmentId: apt.id,
                              date: apt.date,
                              time: apt.time,
                            })
                          )
                          e.dataTransfer.effectAllowed = 'move'
                          handleDragStart(e, apt)
                        }}
                      />
                    ))}
                  </div>
                )}
                {!isOutside && !isBreak && !isBlocked && slotAppts.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4 text-rose/40" />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
