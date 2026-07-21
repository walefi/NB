import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  selected?: boolean
}

export function Card({
  children,
  className = '',
  onClick,
  selected,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`rounded-3xl bg-white dark:bg-black border-2 p-6 transition-all duration-300 ${
        selected
          ? 'border-rose dark:border-rose-light shadow-lg shadow-rose/20'
          : 'border-rose-100 dark:border-rose-dark/20 hover:border-rose/40 dark:hover:border-rose-dark/40 hover:shadow-md'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
