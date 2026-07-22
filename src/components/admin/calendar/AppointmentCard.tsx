import { memo, useRef } from 'react'
import { Clock, GripVertical } from 'lucide-react'
import { getStatusBg, getStatusLabel, formatTimeRange, getAppointmentHeight } from '@/lib/calendar/utils'
import type { Appointment } from '@/types'

interface Props {
  appointment: Appointment
  slotHeight?: number
  onClick: (apt: Appointment) => void
  onDragStart: (e: React.DragEvent, apt: Appointment) => void
}

export const AppointmentCard = memo(function AppointmentCard({
  appointment,
  slotHeight = 48,
  onClick,
  onDragStart,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const height = getAppointmentHeight(appointment.serviceDuration, slotHeight)
  const statusBg = getStatusBg(appointment.status)

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={(e) => onDragStart(e, appointment)}
      onClick={() => onClick(appointment)}
      onKeyPress={(e) => { if (e.key === 'Enter') onClick(appointment) }}
      tabIndex={0}
      role="button"
      aria-label={`${appointment.clientName} - ${appointment.serviceName} - ${appointment.time}`}
      className={`absolute left-0 right-0 mx-1 rounded-lg border-l-4 p-2 cursor-pointer
        hover:shadow-md transition-all duration-200 group z-10
        ${statusBg}`}
      style={{ height: `${Math.max(height, 44)}px`, top: 0 }}
    >
      <div className="flex items-start justify-between h-full">
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5">
            <GripVertical className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-grab" />
            <p className="text-xs font-semibold text-black dark:text-white truncate">
              {appointment.clientName}
            </p>
          </div>
          <p className="text-[11px] text-black/60 dark:text-white/60 truncate mt-0.5 ml-4">
            {appointment.serviceName}
          </p>
          {height > 50 && (
            <div className="flex items-center gap-2 mt-1 ml-4">
              <span className="text-[10px] text-black/50 dark:text-white/50 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeRange(appointment.time, appointment.serviceDuration)}
              </span>
            </div>
          )}
          {height > 70 && (
            <div className="flex items-center gap-2 mt-0.5 ml-4">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                appointment.status === 'confirmed' ? 'bg-green-200 text-green-800 dark:bg-green-800/40 dark:text-green-300' :
                appointment.status === 'pending' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800/40 dark:text-yellow-300' :
                appointment.status === 'completed' ? 'bg-blue-200 text-blue-800 dark:bg-blue-800/40 dark:text-blue-300' :
                'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {getStatusLabel(appointment.status)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
