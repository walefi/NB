import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Calendar, LogOut } from 'lucide-react'
import { NotificationBell } from '@/components/admin/notifications/NotificationBell'
import { useNotifications } from '@/hooks/admin/useNotifications'
import type { ThemeMode } from '@/types'

interface DesktopHeaderProps {
  theme: ThemeMode
  onToggleTheme: () => void
  onLogout: () => void
}

export function DesktopHeader({ onLogout }: DesktopHeaderProps) {
  const today = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
  const capitalizedToday = today.charAt(0).toUpperCase() + today.slice(1)
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()

  return (
    <header className="hidden lg:block h-16 bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-rose-100 dark:border-rose-dark/20">
      <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-dark/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-rose dark:text-rose-light" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-black dark:text-white">
              NB Nail
            </h2>
            <p className="text-xs text-black/50 dark:text-white/50">
              {capitalizedToday}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
          />
          <button
            onClick={onLogout}
            className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-dark/20 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-dark/30 transition-colors"
          >
            <LogOut className="w-5 h-5 text-rose dark:text-rose-light" />
          </button>
        </div>
      </div>
    </header>
  )
}
