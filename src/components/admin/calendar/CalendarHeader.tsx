import { memo, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Search,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  getMonthYear,
  formatDate,
  getToday,
} from '@/lib/calendar/utils'
import type { AppointmentStatus } from '@/types'
import type { CalendarView } from '@/lib/calendar/utils'
import type { CalendarFilters } from '@/hooks/admin/useCalendar'
import type { Service } from '@/types'

interface Props {
  view: CalendarView
  currentDate: string
  filters: CalendarFilters
  services: Service[]
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onViewChange: (view: CalendarView) => void
  onFilterChange: (updates: Partial<CalendarFilters>) => void
}

const STATUS_OPTIONS: { value: AppointmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'completed', label: 'Concluido' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'no_show', label: 'Nao compareceu' },
]

export const CalendarHeader = memo(function CalendarHeader({
  view,
  currentDate,
  filters,
  services,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  onFilterChange,
}: Props) {
  const { month, year } = getMonthYear(currentDate)
  const isToday = currentDate === getToday()

  const getTitle = () => {
    if (view === 'day') return formatDate(currentDate)
    if (view === 'week') return `${month} ${year}`
    return `${month} ${year}`
  }

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange({ searchQuery: e.target.value })
    },
    [onFilterChange]
  )

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFilterChange({ status: e.target.value as AppointmentStatus | 'all' })
    },
    [onFilterChange]
  )

  const handleServiceChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFilterChange({ serviceId: e.target.value })
    },
    [onFilterChange]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-rose" />
          <h1 className="text-2xl font-bold text-black dark:text-white">Agenda</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-rose-100 dark:border-rose-dark/20 rounded-xl p-1">
            {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  view === v
                    ? 'bg-rose text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
                aria-label={`Visualizar ${v === 'day' ? 'dia' : v === 'week' ? 'semana' : 'mes'}`}
              >
                {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-dark/10 transition-colors text-black dark:text-white"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-black dark:text-white min-w-[200px] text-center">
            {getTitle()}
          </h2>
          <button
            onClick={onNext}
            className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-dark/10 transition-colors text-black dark:text-white"
            aria-label="Proximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          {!isToday && (
            <Button variant="ghost" size="sm" onClick={onToday}>
              Hoje
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={handleSearch}
              placeholder="Buscar cliente..."
              className="w-full sm:w-48 pl-9 pr-3 py-2 text-sm rounded-xl border border-rose-100 dark:border-rose-dark/20 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
              aria-label="Buscar por nome ou telefone"
            />
          </div>

          <div className="flex items-center gap-1">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="px-3 py-2 text-sm rounded-xl border border-rose-100 dark:border-rose-dark/20 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
              aria-label="Filtrar por status"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {services.length > 0 && (
            <select
              value={filters.serviceId}
              onChange={handleServiceChange}
              className="px-3 py-2 text-sm rounded-xl border border-rose-100 dark:border-rose-dark/20 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-rose"
              aria-label="Filtrar por servico"
            >
              <option value="">Todos servicos</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  )
})
