import type { AppointmentStatus } from '@/types'

interface AppointmentFiltersProps {
  dateFilter: string
  onDateFilterChange: (value: string) => void
  statusFilter: AppointmentStatus | 'all'
  onStatusFilterChange: (value: AppointmentStatus | 'all') => void
}

export function AppointmentFilters({
  dateFilter,
  onDateFilterChange,
  statusFilter,
  onStatusFilterChange,
}: AppointmentFiltersProps) {
  const statusOptions: { value: AppointmentStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'confirmed', label: 'Confirmados' },
    { value: 'completed', label: 'Concluídos' },
    { value: 'cancelled', label: 'Cancelados' },
    { value: 'no_show', label: 'Não compareceram' },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <input
        type="date"
        value={dateFilter}
        onChange={(e) => onDateFilterChange(e.target.value)}
        className="px-4 py-2 rounded-xl border-2 border-rose-100 dark:border-rose-dark/30 bg-white dark:bg-black text-black dark:text-white text-sm focus:border-rose dark:focus:border-rose-light focus:ring-2 focus:ring-rose/10 dark:focus:ring-rose/20 outline-none transition-all"
      />
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusFilterChange(opt.value)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
              statusFilter === opt.value
                ? 'bg-rose text-white'
                : 'bg-rose-50 dark:bg-rose-dark/10 text-rose dark:text-rose-light/70 hover:bg-rose-100 dark:hover:bg-rose-dark/20'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
