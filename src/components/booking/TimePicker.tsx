import { Clock, Lock } from 'lucide-react'
import { AvailabilityEngine } from '@/lib/availability-engine'
import type { Appointment, BusinessSettings } from '@/types'

interface TimePickerProps {
  selectedTime: string
  onSelect: (time: string) => void
  selectedDate: string
  availableSlots: string[]
  loading?: boolean
  serviceDuration?: number
  appointments?: Appointment[]
  settings?: BusinessSettings | null
}

export function TimePicker({
  selectedTime,
  onSelect,
  selectedDate,
  availableSlots,
  loading = false,
  serviceDuration = 60,
  appointments = [],
  settings = null,
}: TimePickerProps) {
  const allSlots = AvailabilityEngine.getAvailableSlotsForDate(
    selectedDate,
    settings,
    appointments,
    serviceDuration
  )

  const unavailableSlots = allSlots.filter((s) => !availableSlots.includes(s))

  const groupSlots = (slots: string[]) => {
    const grouped: Record<string, string[]> = {}
    for (const slot of slots) {
      const hour = slot.split(':')[0]
      const label = `${hour}:00 - ${hour}:59`
      if (!grouped[label]) grouped[label] = []
      grouped[label].push(slot)
    }
    return grouped
  }

  const groupedAvailable = groupSlots(availableSlots)
  const groupedUnavailable = groupSlots(unavailableSlots)
  const allGrouped: Record<string, { available: string[]; unavailable: string[] }> = {}

  for (const [label, slots] of Object.entries(groupedAvailable)) {
    allGrouped[label] = { available: slots, unavailable: [] }
  }
  for (const [label, slots] of Object.entries(groupedUnavailable)) {
    if (!allGrouped[label]) allGrouped[label] = { available: [], unavailable: [] }
    allGrouped[label].unavailable.push(...slots)
  }

  if (!selectedDate) {
    return (
      <div className="text-center py-12 text-rose/50 dark:text-rose-light/40">
        <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Selecione uma data primeiro</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-rose/50 dark:text-rose-light/40">
        <div className="w-6 h-6 border-2 border-rose border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Carregando horarios...</p>
      </div>
    )
  }

  if (availableSlots.length === 0 && unavailableSlots.length === 0) {
    return (
      <div className="text-center py-12 text-rose/50 dark:text-rose-light/40">
        <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Nenhum horario disponivel para esta data</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Object.entries(allGrouped).map(([label, { available, unavailable }]) => (
        <div key={label}>
          <p className="text-xs font-medium text-rose/40 dark:text-rose-light/40 mb-2 uppercase tracking-wider">
            {label}
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {unavailable.map((slot) => (
              <button
                key={slot}
                disabled
                className="py-2.5 px-2 text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-1 min-h-[40px] bg-rose-50/40 dark:bg-rose-dark/5 text-rose-100 dark:text-rose-dark/20 cursor-not-allowed line-through decoration-rose-200/50"
              >
                <Lock className="w-3 h-3" />
                {slot}
              </button>
            ))}
            {available.map((slot) => {
              const isSelected = selectedTime === slot
              return (
                <button
                  key={slot}
                  onClick={() => onSelect(slot)}
                  className={`py-2.5 px-2 text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-1 min-h-[40px] ${
                    isSelected
                      ? 'bg-rose text-white font-medium shadow-md shadow-rose/20 scale-[1.02]'
                      : 'bg-rose-50 dark:bg-rose-dark/10 text-black dark:text-white hover:bg-rose-100 dark:hover:bg-rose-dark/20 active:scale-95'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {slot}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <p className="text-xs text-rose/40 dark:text-rose-light/30 text-center pt-2">
        Horarios com cadeado ja estao reservados.
      </p>
    </div>
  )
}
