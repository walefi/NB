import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  loading?: boolean
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 font-medium rounded-2xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose/50 disabled:opacity-50 disabled:cursor-not-allowed'

const variantClasses: Record<string, string> = {
  primary:
    'bg-rose text-white hover:bg-rose-dark active:scale-[0.98] shadow-lg shadow-rose/25 hover:shadow-rose/40',
  secondary:
    'bg-pink text-black hover:bg-pink-dark active:scale-[0.98]',
  outline:
    'border-2 border-rose dark:border-rose-light text-rose dark:text-rose-light hover:bg-rose dark:hover:bg-rose-dark/20 active:scale-[0.98]',
  ghost:
    'text-rose dark:text-rose-light hover:bg-rose-50 dark:hover:bg-rose-dark/20',
}

const sizeClasses: Record<string, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
