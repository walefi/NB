import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, Trash2, Clock, ArrowLeft, CheckCheck } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { DesktopHeader } from '@/components/admin/layout/DesktopHeader'
import { Button } from '@/components/ui/Button'
import { useNotifications } from '@/hooks/admin/useNotifications'
import type { ThemeMode, NotificationType } from '@/types'

interface AdminNotificationsProps {
  theme: ThemeMode
  onToggleTheme: () => void
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

const typeLabels: Record<NotificationType, string> = {
  new_appointment: 'Novo',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  rescheduled: 'Reagendado',
  completed: 'Finalizado',
  reminder_24h: '24h',
  reminder_2h: '2h',
  reminder_30min: '30min',
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes}min atras`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atras`
  const days = Math.floor(hours / 24)
  return `${days}d atras`
}

export function AdminNotifications({ theme, onToggleTheme }: AdminNotificationsProps) {
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all')
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all')

  const filtered = notifications.filter((n) => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false
    if (readFilter === 'read' && !n.read) return false
    if (readFilter === 'unread' && n.read) return false
    return true
  })

  const handleLogout = () => {
    localStorage.removeItem('nb_admin_auth')
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <DesktopHeader theme={theme} onToggleTheme={onToggleTheme} onLogout={handleLogout} />

      <AdminSidebar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="ml-0 lg:ml-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-dark/20 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-dark/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-rose dark:text-rose-light" />
            </button>
            <div className="flex-1">
              <h1 className="font-serif text-3xl font-bold text-black dark:text-white">
                Notificacoes
              </h1>
              <p className="text-sm text-black/50 dark:text-white/50 mt-1">
                {unreadCount > 0 ? `${unreadCount} nao lida(s)` : 'Tudo lido'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="w-4 h-4" />
                Marcar todas
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex gap-1">
              {(['all', 'unread', 'read'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setReadFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    readFilter === f
                      ? 'bg-rose text-white'
                      : 'bg-rose-50 dark:bg-rose-dark/10 text-rose dark:text-rose-light/70 hover:bg-rose-100 dark:hover:bg-rose-dark/20'
                  }`}
                >
                  {f === 'all' ? 'Todas' : f === 'unread' ? 'Nao lidas' : 'Lidas'}
                </button>
              ))}
            </div>
            <div className="w-px bg-rose-100 dark:bg-rose-dark/20" />
            <div className="flex gap-1">
              {(['all', 'new_appointment', 'confirmed', 'cancelled', 'rescheduled', 'completed'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    typeFilter === t
                      ? 'bg-rose text-white'
                      : 'bg-rose-50 dark:bg-rose-dark/10 text-rose dark:text-rose-light/70 hover:bg-rose-100 dark:hover:bg-rose-dark/20'
                  }`}
                >
                  {t === 'all' ? 'Todos' : typeLabels[t]}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-dark/20 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-rose dark:text-rose-light" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-black dark:text-white mb-2">
                Nenhuma notificacao
              </h3>
              <p className="text-sm text-black/50 dark:text-white/50">
                As notificacoes aparecerao aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                    !notif.read
                      ? 'border-rose-200 dark:border-rose-dark/30 bg-rose-50/30 dark:bg-rose-dark/5'
                      : 'border-rose-100 dark:border-rose-dark/20 bg-white dark:bg-black hover:border-rose-200 dark:hover:border-rose-dark/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColors[notif.type] || 'bg-gray-100 text-gray-500'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColors[notif.type]}`}>
                        {typeLabels[notif.type]}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-rose" />
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-black dark:text-white">
                      {notif.title}
                    </h4>
                    <p className="text-sm text-black/60 dark:text-white/60 mt-0.5">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-black/40 dark:text-white/40">
                        <Clock className="w-3 h-3" />
                        {formatDate(notif.date)} {notif.time}
                      </span>
                      <span className="text-xs text-black/40 dark:text-white/40">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        title="Marcar como lida"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
