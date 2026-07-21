import { Clock, Lock } from 'lucide-react'
import { TIME_SLOTS, MOCK_UNAVAILABLE_TIMES } from '@/constants'

interface TimePickerProps {
  selectedTime: string
  onSelect: (time: string) => void
  selectedDate: string
  existingTimes?: string[]
}

export function TimePicker({
  selectedTime,
  onSelect,
  selectedDate,
  existingTimes = [],
}: TimePickerProps) {
  const allUnavailable = Array.from(new Set([...existingTimes, ...MOCK_UNAVAILABLE_TIMES]))

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

  const grouped = groupSlots(TIME_SLOTS)

  if (!selectedDate) {
    return (
      <div className="text-center py-12 text-rose/50 dark:text-rose-light/40">
        <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Selecione uma data primeiro</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([label, slots]) => (
        <div key={label}>
          <p className="text-xs font-medium text-rose/40 dark:text-rose-light/40 mb-2 uppercase tracking-wider">
            {label}
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {slots.map((slot) => {
              const unavailable = allUnavailable.includes(slot)
              const isSelected = selectedTime === slot
              return (
                <button
                  key={slot}
                  onClick={() => !unavailable && onSelect(slot)}
                  disabled={unavailable}
                  className={`py-2.5 px-2 text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-1 min-h-[40px] ${
                    unavailable
                      ? 'bg-rose-50/40 dark:bg-rose-dark/5 text-rose-100 dark:text-rose-dark/20 cursor-not-allowed line-through decoration-rose-200/50'
                      : isSelected
                        ? 'bg-rose text-white font-medium shadow-md shadow-rose/20 scale-[1.02]'
                        : 'bg-rose-50 dark:bg-rose-dark/10 text-black dark:text-white hover:bg-rose-100 dark:hover:bg-rose-dark/20 active:scale-95'
                  }`}
                >
                  {unavailable ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
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
