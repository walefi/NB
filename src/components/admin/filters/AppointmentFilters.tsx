import { APPOINTMENT_STATUS } from '@/constants/appointment-status'
import type { AppointmentStatus } from '@/constants/appointment-status'
import type { Service } from '@/types'

interface AppointmentFiltersProps {
  dateFilter: string
  onDateFilterChange: (value: string) => void
  statusFilter: AppointmentStatus | 'all'
  onStatusFilterChange: (value: AppointmentStatus | 'all') => void
  searchQuery: string
  onSearchChange: (value: string) => void
  serviceFilter?: string
  onServiceFilterChange?: (value: string) => void
  services?: Service[]
}

const dateOptions = [
  { value: '', label: 'Todos' },
  { value: 'today', label: 'Hoje' },
  { value: 'tomorrow', label: 'Amanha' },
  { value: 'week', label: 'Esta semana' },
]

export function AppointmentFilters({
  dateFilter,
  onDateFilterChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  serviceFilter = '',
  onServiceFilterChange,
  services = [],
}: AppointmentFiltersProps) {
  const statusOptions: { value: AppointmentStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: APPOINTMENT_STATUS.CONFIRMED, label: 'Confirmado' },
    { value: APPOINTMENT_STATUS.COMPLETED, label: 'Concluido' },
    { value: APPOINTMENT_STATUS.CANCELLED, label: 'Cancelado' },
    { value: APPOINTMENT_STATUS.DELETED, label: 'Excluido' },
  ]

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const getDisplayDate = () => {
    if (dateFilter === today) return 'today'
    if (dateFilter === tomorrow) return 'tomorrow'
    if (dateFilter === weekStartStr) return 'week'
    return ''
  }

  const handleDateSelect = (value: string) => {
    if (value === 'today') {
      onDateFilterChange(today)
    } else if (value === 'tomorrow') {
      onDateFilterChange(tomorrow)
    } else if (value === 'week') {
      onDateFilterChange(weekStartStr)
    } else {
      onDateFilterChange('')
    }
  }

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={getDisplayDate()}
          onChange={(e) => handleDateSelect(e.target.value)}
          className="pl-3 pr-10 py-2 rounded-xl border-2 border-rose-100 dark:border-rose-dark/30 bg-white dark:bg-black text-black dark:text-white text-sm focus:border-rose dark:focus:border-rose-light focus:ring-2 focus:ring-rose/10 dark:focus:ring-rose/20 outline-none transition-all appearance-none"
        >
          {dateOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-black">
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as AppointmentStatus | 'all')}
          className="pl-3 pr-10 py-2 rounded-xl border-2 border-rose-100 dark:border-rose-dark/30 bg-white dark:bg-black text-black dark:text-white text-sm focus:border-rose dark:focus:border-rose-light focus:ring-2 focus:ring-rose/10 dark:focus:ring-rose/20 outline-none transition-all appearance-none"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-black">
              {opt.label}
            </option>
          ))}
        </select>

        {services.length > 0 && onServiceFilterChange && (
          <select
            value={serviceFilter}
            onChange={(e) => onServiceFilterChange(e.target.value)}
            className="pl-3 pr-10 py-2 rounded-xl border-2 border-rose-100 dark:border-rose-dark/30 bg-white dark:bg-black text-black dark:text-white text-sm focus:border-rose dark:focus:border-rose-light focus:ring-2 focus:ring-rose/10 dark:focus:ring-rose/20 outline-none transition-all appearance-none"
          >
            <option value="" className="bg-white dark:bg-black">Todos servicos</option>
            {services.filter((s) => s.isActive).map((s) => (
              <option key={s.id} value={s.id} className="bg-white dark:bg-black">
                {s.name}
              </option>
            ))}
          </select>
        )}

        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Pesquisar por nome ou telefone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-4 pr-4 py-2 rounded-xl border-2 border-rose-100 dark:border-rose-dark/30 bg-white dark:bg-black text-black dark:text-white text-sm focus:border-rose dark:focus:border-rose-light focus:ring-2 focus:ring-rose/10 dark:focus:ring-rose/20 outline-none transition-all"
          />
        </div>
      </div>
    </div>
  )
}
