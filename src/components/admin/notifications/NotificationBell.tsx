import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { NotificationPanel } from './NotificationPanel'
import type { Notification } from '@/types'

interface NotificationBellProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
}

export function NotificationBell({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-dark/20 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-dark/30 transition-colors"
      >
        <Bell className="w-5 h-5 text-rose dark:text-rose-light" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose text-white text-[10px] font-bold flex items-center justify-center px-1 animate-fade-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onDelete={onDelete}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
