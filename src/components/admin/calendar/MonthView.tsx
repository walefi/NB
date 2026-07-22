import { memo, useMemo, useCallback } from 'react'
import {
  getMonthDates,
  getDayNumber,
  isToday,
  getAppointmentsForDate,
  formatDateShort,
} from '@/lib/calendar/utils'
import { getStatusDot } from '@/lib/calendar/utils'
import type { Appointment } from '@/types'

interface Props {
  currentDate: string
  appointments: Appointment[]
  onSelectDate: (date: string) => void
  onSelectAppointment: (apt: Appointment) => void
}

export const MonthView = memo(function MonthView({
  currentDate,
  appointments,
  onSelectDate,
  onSelectAppointment,
}: Props) {
  const dates = useMemo(() => {
    const d = new Date(currentDate + 'T12:00:00')
    return getMonthDates(d.getFullYear(), d.getMonth())
  }, [currentDate])

  const d = new Date(currentDate + 'T12:00:00')
  const currentMonth = d.getMonth()

  const handleDayClick = useCallback(
    (date: string) => {
      onSelectDate(date)
    },
    [onSelectDate]
  )

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
        {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1">
        {dates.map((date) => {
          const dateObj = new Date(date + 'T12:00:00')
          const isCurrentMonth = dateObj.getMonth() === currentMonth
          const today = isToday(date)
          const dayAppts = getAppointmentsForDate(date, appointments)

          return (
            <button
              key={date}
              onClick={() => handleDayClick(date)}
              className={`min-h-[80px] sm:min-h-[100px] p-1.5 border-b border-r border-gray-100 dark:border-gray-800
                text-left transition-colors
                ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-900/20' : ''}
                ${today ? 'bg-rose-50 dark:bg-rose-dark/10' : ''}
                hover:bg-gray-50 dark:hover:bg-gray-900/30`}
              aria-label={`${formatDateShort(date)} - ${dayAppts.length} agendamentos`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-medium ${
                    today
                      ? 'bg-rose text-white rounded-full w-6 h-6 flex items-center justify-center'
                      : isCurrentMonth
                      ? 'text-black dark:text-white'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}
                >
                  {getDayNumber(date)}
                </span>
                {dayAppts.length > 3 && (
                  <span className="text-[10px] text-gray-400">
                    +{dayAppts.length - 3}
                  </span>
                )}
              </div>

              <div className="space-y-0.5">
                {dayAppts.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectAppointment(apt)
                    }}
                    className={`flex items-center gap-1 px-1 py-0.5 rounded text-[10px] truncate cursor-pointer
                      ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        apt.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDot(apt.status)}`} />
                    <span className="truncate">{apt.time} {apt.clientName}</span>
                  </div>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
})
