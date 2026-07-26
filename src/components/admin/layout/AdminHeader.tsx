import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Calendar, BellRing, BellOff } from 'lucide-react'
import { useFCM } from '@/hooks/admin/useFCM'
import type { ThemeMode } from '@/types'

interface AdminHeaderProps {
  theme: ThemeMode
  onToggleTheme: () => void
  onLogout: () => void
}

export function AdminHeader(_props: AdminHeaderProps) {
  const today = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
  const capitalizedToday = today.charAt(0).toUpperCase() + today.slice(1)
  const { supported, enabled, enabling, enableNotifications, disableNotifications } = useFCM()

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-rose-100 dark:border-rose-dark/20 h-16 flex items-center justify-between px-4 sm:px-6 lg:hidden">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-dark/20 flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5 text-rose dark:text-rose-light" />
        </div>
        <div>
          <h2 className="font-serif text-lg font-bold text-black dark:text-white">
            NB Nail
          </h2>
          <p className="text-xs text-black/50 dark:text-white/50 mt-1">
            {capitalizedToday}
          </p>
        </div>
      </div>

      {supported && (
        <div className="flex items-center gap-2">
          {enabled ? (
            <button
              onClick={disableNotifications}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ativas</span>
            </button>
          ) : (
            <button
              onClick={enableNotifications}
              disabled={enabling}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-dark/20 text-rose dark:text-rose-light text-xs font-medium hover:bg-rose-100 dark:hover:bg-rose-dark/30 transition-colors disabled:opacity-50"
            >
              <BellOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ativar</span>
            </button>
          )}
        </div>
      )}
    </header>
  )
}