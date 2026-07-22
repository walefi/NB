import { memo, useCallback, useMemo, useState } from 'react'
import {
  generateTimeSlots,
  getDaySchedule,
  isDateBlocked,
  isBreakTime,
  isTimeBlocked,
  getAppointmentsForSlot,
  getDayNameShort,
  getDayNumber,
  isToday,
  formatDate,
} from '@/lib/calendar/utils'
import { AppointmentCard } from './AppointmentCard'
import type { Appointment, BusinessSettings } from '@/types'

interface Props {
  weekDates: string[]
  appointments: Appointment[]
  settings: BusinessSettings | null
  onSelectAppointment: (apt: Appointment) => void
  onDragEnd: (apt: Appointment, newDate: string, newTime: string) => void
  onCreateAtSlot: (date: string, time: string) => void
  onSelectDate: (date: string) => void
}

const SLOT_HEIGHT = 48

export const WeekView = memo(function WeekView({
  weekDates,
  appointments,
  settings,
  onSelectAppointment,
  onDragEnd,
  onCreateAtSlot,
  onSelectDate,
}: Props) {
  const [dragOverSlot, setDragOverSlot] = useState<{ date: string; time: string } | null>(null)
  const timeSlots = useMemo(() => generateTimeSlots(8, 20), [])

  const handleDragStart = useCallback((_e: React.DragEvent, _apt: Appointment) => {}, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, targetDate: string, targetTime: string) => {
      e.preventDefault()
      setDragOverSlot(null)
      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'))
        if (data.appointmentId) {
          onDragEnd(
            { id: data.appointmentId, date: data.date, time: data.time } as Appointment,
            targetDate,
            targetTime
          )
        }
      } catch { /* */ }
    },
    [onDragEnd]
  )

  const handleDragOver = useCallback((e: React.DragEvent, date: string, time: string) => {
    e.preventDefault()
    setDragOverSlot({ date, time })
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverSlot(null)
  }, [])

  const handleSlotClick = useCallback(
    (date: string, time: string) => {
      if (isDateBlocked(date, settings)) return
      const schedule = getDaySchedule(date, settings)
      if (!schedule.open) return
      if (time < schedule.startTime || time >= schedule.endTime) return
      if (isBreakTime(time, settings?.breaks || [])) return
      if (isTimeBlocked(date, time, settings)) return

      const slotAppts = getAppointmentsForSlot(date, time, appointments)
      if (slotAppts.length === 0) {
        onCreateAtSlot(date, time)
      }
    },
    [settings, appointments, onCreateAtSlot]
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-black z-20">
        <div className="w-14 sm:w-16 shrink-0" />
        {weekDates.map((date) => {
          const today = isToday(date)
          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={`flex-1 py-2 px-1 text-center border-l border-gray-100 dark:border-gray-800
                ${today ? 'bg-rose-50 dark:bg-rose-dark/10' : ''}
                hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors`}
              aria-label={formatDate(date)}
            >
              <p className={`text-[10px] font-medium ${
                today ? 'text-rose' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {getDayNameShort(date)}
              </p>
              <p className={`text-lg font-bold ${
                today
                  ? 'bg-rose text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                  : 'text-black dark:text-white'
              }`}>
                {getDayNumber(date)}
              </p>
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {timeSlots.map((slotTime) => (
          <div key={slotTime} className="flex" style={{ minHeight: `${SLOT_HEIGHT}px` }}>
            <div className="w-14 sm:w-16 shrink-0 py-2 px-2 text-right border-b border-gray-100 dark:border-gray-800">
              <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                {slotTime}
              </span>
            </div>

            {weekDates.map((date) => {
              const slotAppts = getAppointmentsForSlot(date, slotTime, appointments)
              const isBreak = isBreakTime(slotTime, settings?.breaks || [])
              const isBlocked = isTimeBlocked(date, slotTime, settings)
              const schedule = getDaySchedule(date, settings)
              const isOutside = !schedule.open || slotTime < schedule.startTime || slotTime >= schedule.endTime
              const dayBlocked = isDateBlocked(date, settings)
              const isDropTarget = dragOverSlot?.date === date && dragOverSlot?.time === slotTime
              const today = isToday(date)

              return (
                <div
                  key={`${date}-${slotTime}`}
                  className={`flex-1 border-l border-b border-gray-100 dark:border-gray-800 relative
                    ${isDropTarget ? 'bg-rose-50 dark:bg-rose-dark/10' : ''}
                    ${isBreak ? 'bg-gray-50 dark:bg-gray-900/50' : ''}
                    ${isBlocked || dayBlocked ? 'bg-red-50/30 dark:bg-red-900/5' : ''}
                    ${isOutside ? 'bg-gray-50/30 dark:bg-gray-900/20' : ''}
                    ${today ? 'bg-rose-50/20 dark:bg-rose-dark/5' : ''}
                    hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors cursor-pointer`}
                  style={{ minHeight: `${SLOT_HEIGHT}px` }}
                  onDragOver={(e) => handleDragOver(e, date, slotTime)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, date, slotTime)}
                  onClick={() => handleSlotClick(date, slotTime)}
                  role="gridcell"
                  aria-label={`${formatDate(date)} ${slotTime}`}
                >
                  {slotAppts.length > 0 && (
                    <div className="relative h-full p-0.5">
                      {slotAppts.map((apt) => (
                        <AppointmentCard
                          key={apt.id}
                          appointment={apt}
                          slotHeight={SLOT_HEIGHT}
                          onClick={(a) => { onSelectAppointment(a) }}
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
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
})
