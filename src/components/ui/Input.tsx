import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({
  label,
  error,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-black dark:text-white/80 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-3 rounded-2xl border-2 border-rose-100 dark:border-rose-dark/30 bg-white dark:bg-black text-black dark:text-white placeholder:text-rose-200 dark:placeholder:text-rose-dark/40 focus:border-rose dark:focus:border-rose-light focus:ring-2 focus:ring-rose/10 dark:focus:ring-rose/20 outline-none transition-all duration-300 ${error ? 'border-pink-dark dark:border-pink-dark' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-pink-dark">{error}</p>
      )}
    </div>
  )
}
