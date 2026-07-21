import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  selectedDate: string
  onSelect: (date: string) => void
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function isSunday(date: Date) {
  return date.getDay() === 0
}

function isPast(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d < today
}

function formatDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function DatePicker({ selectedDate, onSelect }: DatePickerProps) {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const lastDay = new Date(viewYear, viewMonth + 1, 0)
    const startDay = firstDay.getDay()
    const totalDays = lastDay.getDate()

    const cells: (number | null)[] = []
    for (let i = 0; i < startDay; i++) cells.push(null)
    for (let d = 1; d <= totalDays; d++) cells.push(d)
    return cells
  }, [viewMonth, viewYear])

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const isBeyondMaxDate = (d: number) => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 2)
    const cellDate = new Date(viewYear, viewMonth, d)
    return cellDate > maxDate
  }

  const handleSelectDay = (d: number) => {
    const date = new Date(viewYear, viewMonth, d)
    onSelect(formatDateStr(date))
  }

  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T12:00:00') : null

  const isWeekend = (d: number) => {
    const date = new Date(viewYear, viewMonth, d)
    return date.getDay() === 0 || date.getDay() === 6
  }

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(e.target.value)
  }

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-black dark:text-white/80 mb-1.5">
          Data preferida
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateInput}
          className="w-full px-4 py-3 rounded-2xl border-2 border-rose-100 dark:border-rose-dark/30 bg-white dark:bg-black text-black dark:text-white focus:border-rose dark:focus:border-rose-light focus:ring-2 focus:ring-rose/10 dark:focus:ring-rose/20 outline-none transition-all duration-300"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="rounded-3xl border-2 border-rose-100 dark:border-rose-dark/20 p-4 sm:p-6 bg-white dark:bg-black">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            disabled={viewMonth === today.getMonth() && viewYear === today.getFullYear()}
            className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-dark/20 text-rose dark:text-rose-light disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-serif text-lg text-black dark:text-white font-medium">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-dark/20 text-rose dark:text-rose-light transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-rose dark:text-rose-light/70 py-1"
            >
              {day}
            </div>
          ))}
          {daysInMonth.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />
            const date = new Date(viewYear, viewMonth, day)
            const past = isPast(date)
            const sunday = isSunday(date)
            const weekend = isWeekend(day)
            const tooFar = isBeyondMaxDate(day)
            const disabled = past || sunday || tooFar
            const isSelected =
              selectedDateObj &&
              selectedDateObj.getDate() === day &&
              selectedDateObj.getMonth() === viewMonth &&
              selectedDateObj.getFullYear() === viewYear

            return (
              <button
                key={day}
                onClick={() => !disabled && handleSelectDay(day)}
                disabled={disabled}
                className={`py-2 text-sm rounded-xl transition-all duration-200 ${
                  disabled
                    ? 'text-rose-100 dark:text-rose-dark/20 cursor-not-allowed'
                    : isSelected
                      ? 'bg-rose text-white font-semibold shadow-md shadow-rose/20'
                      : weekend
                        ? 'text-rose dark:text-rose-light/40 hover:bg-rose-50 dark:hover:bg-rose-dark/10'
                        : 'text-black dark:text-white hover:bg-rose-50 dark:hover:bg-rose-dark/10'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-rose dark:text-rose-light/50 mt-3 text-center">
          * Não trabalhamos aos domingos. Agendamentos com até 2 meses de antecedência.
        </p>
      </div>
    </div>
  )
}
