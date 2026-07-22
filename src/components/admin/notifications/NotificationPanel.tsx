import { Bell, Check, Trash2, Clock } from 'lucide-react'
import type { Notification } from '@/types'

interface NotificationPanelProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
  onClose: () => void
}

const typeColors: Record<string, string> = {
  new_appointment: 'bg-rose-50 dark:bg-rose-dark/20 text-rose dark:text-rose-light',
  confirmed: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  cancelled: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  rescheduled: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  completed: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  reminder_24h: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  reminder_2h: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  reminder_30min: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export function NotificationPanel({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClose,
}: NotificationPanelProps) {
  const displayNotifications = notifications.slice(0, 20)

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-black rounded-2xl border-2 border-rose-100 dark:border-rose-dark/20 shadow-xl z-50 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b border-rose-100 dark:border-rose-dark/20">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-sm font-semibold text-black dark:text-white">
            Notificacoes
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-rose dark:text-rose-light hover:text-rose-dark dark:hover:text-rose-light/80 transition-colors"
          >
            Marcar todas
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {displayNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-rose/30 dark:text-rose-light/30 mx-auto mb-2" />
            <p className="text-sm text-black/50 dark:text-white/50">Nenhuma notificacao</p>
          </div>
        ) : (
          displayNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 p-4 border-b border-rose-50 dark:border-rose-dark/10 transition-colors hover:bg-rose-50/50 dark:hover:bg-rose-dark/5 ${
                !notif.read ? 'bg-rose-50/30 dark:bg-rose-dark/5' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[notif.type] || 'bg-gray-100 text-gray-500'}`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-semibold text-black dark:text-white ${!notif.read ? 'font-bold' : ''}`}>
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-rose shrink-0" />
                  )}
                </div>
                <p className="text-xs text-black/60 dark:text-white/60 mt-0.5 line-clamp-2">
                  {notif.message}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-black/40 dark:text-white/40">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(notif.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => onMarkAsRead(notif.id)}
                    className="w-6 h-6 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(notif.id)}
                  className="w-6 h-6 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-rose-100 dark:border-rose-dark/20">
          <a
            href="/admin/notifications"
            className="block text-center text-xs font-medium text-rose dark:text-rose-light hover:text-rose-dark dark:hover:text-rose-light/80 transition-colors py-1"
            onClick={onClose}
          >
            Ver todas as notificacoes
          </a>
        </div>
      )}
    </div>
  )
}
