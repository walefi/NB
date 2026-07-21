import { MoonStar, Sun } from 'lucide-react'
import type { ThemeMode } from '@/types'

interface ThemeToggleProps {
  theme: ThemeMode
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-2 rounded-full border border-rose-200 dark:border-rose-dark bg-white dark:bg-black text-rose dark:text-rose-light hover:bg-rose-50 dark:hover:bg-rose-dark/20 transition-all duration-300"
      aria-label={theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4" />
          <span className="text-xs font-medium hidden sm:inline">Claro</span>
        </>
      ) : (
        <>
          <MoonStar className="w-4 h-4" />
          <span className="text-xs font-medium hidden sm:inline">Escuro</span>
        </>
      )}
    </button>
  )
}
