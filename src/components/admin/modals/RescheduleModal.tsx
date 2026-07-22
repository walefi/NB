import { useState } from 'react'
import { X, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Appointment } from '@/types'
import { formatBookingDate } from '@/lib/utils'

interface RescheduleModalProps {
  appointment: Appointment | null
  onClose: () => void
  onReschedule: (id: string, date: string, time: string) => void
}

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
]

export function RescheduleModal({ appointment, onClose, onReschedule }: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  if (!appointment) return null

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onReschedule(appointment.id, selectedDate, selectedTime)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-black rounded-3xl border-2 border-rose-100 dark:border-rose-dark/20 max-w-lg w-full p-6 sm:p-8 animate-fade-in">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-dark/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-rose dark:text-rose-light" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-lg font-semibold text-black dark:text-white">
              Reagendar Agendamento
            </h3>
            <p className="text-xs text-black/50 dark:text-white/50">
              {appointment.clientName} - {formatBookingDate(appointment.date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-black dark:text-white mb-2">Nova Data</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </div>

          {selectedDate && (
            <div>
              <label className="text-xs font-medium text-black dark:text-white mb-2">Novo Horario</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      selectedTime === time
                        ? 'bg-rose text-white'
                        : 'bg-rose-50 dark:bg-rose-dark/10 text-rose dark:text-rose-light hover:bg-rose-100 dark:hover:bg-rose-dark/20'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className="flex-1"
          >
            Confirmar Reagendamento
          </Button>
        </div>
      </div>
    </div>
  )
}