import { memo, useState } from 'react'
import { Clock, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { BusinessSettings, DaySchedule } from '@/types'

interface Props {
  settings: BusinessSettings
  onSave: (data: Partial<BusinessSettings>) => Promise<boolean>
  saving: boolean
}

const DAYS_PT: Record<string, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terca-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sabado',
  sunday: 'Domingo',
}

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export const BusinessHoursEditor = memo(function BusinessHoursEditor({ settings, onSave, saving }: Props) {
  const [hours, setHours] = useState<Record<string, DaySchedule>>(settings.businessHours)

  const updateDay = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  const handleSave = async () => {
    await onSave({ businessHours: hours })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {DAY_ORDER.map((day) => {
          const schedule = hours[day] || { open: false, startTime: '09:00', endTime: '19:00' }
          return (
            <div
              key={day}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-rose-100 dark:border-rose-dark/20 bg-white dark:bg-gray-900"
            >
              <label className="flex items-center gap-3 min-w-[160px]">
                <input
                  type="checkbox"
                  checked={schedule.open}
                  onChange={(e) => updateDay(day, 'open', e.target.checked)}
                  className="w-4 h-4 rounded border-rose-300 text-rose focus:ring-rose"
                />
                <span className="text-sm font-medium text-black dark:text-white">
                  {DAYS_PT[day]}
                </span>
              </label>

              {schedule.open && (
                <div className="flex items-center gap-2 flex-1">
                  <Clock className="w-4 h-4 text-rose shrink-0" />
                  <input
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) => updateDay(day, 'startTime', e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose"
                  />
                  <span className="text-gray-400">as</span>
                  <input
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) => updateDay(day, 'endTime', e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-dark/30 bg-white dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose"
                  />
                </div>
              )}

              {!schedule.open && (
                <span className="text-sm text-gray-400 italic">Fechado</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Horarios'}
        </Button>
      </div>
    </div>
  )
})
