import { Logo } from '@/components/shared/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import type { ThemeMode } from '@/types'

interface HeaderProps {
  theme: ThemeMode
  onToggleTheme: () => void
  hideBooking?: boolean
}

export function Header({ theme, onToggleTheme, hideBooking }: HeaderProps) {
  const scrollToBooking = () => {
    document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-rose-100 dark:border-rose-dark/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-20">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          {!hideBooking && (
            <Button size="sm" onClick={scrollToBooking}>
              Agendar
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
