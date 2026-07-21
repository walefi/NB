import { Link } from 'react-router-dom'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ size = 'md' }: LogoProps) {
  const sizes: Record<string, { icon: string; name: string; sub?: string }> = {
    sm: { icon: 'text-xl', name: 'text-xs' },
    md: { icon: 'text-2xl', name: 'text-sm' },
    lg: { icon: 'text-4xl', name: 'text-lg' },
  }
  const s = sizes[size]
  return (
    <Link to="/" className="flex items-center gap-3 no-underline">
      <span
        className={`${s.icon} font-serif font-bold text-rose dark:text-rose-light tracking-wider`}
      >
        NB
      </span>
      <div className="flex flex-col leading-tight">
        <span className={`${s.name} font-medium text-black dark:text-white tracking-wide`}>
          NATH BITTENCOURT
        </span>
        {size !== 'sm' && (
          <span className="text-[10px] tracking-[0.2em] text-rose dark:text-rose-light/70 uppercase font-medium">
            Nail Design
          </span>
        )}
      </div>
    </Link>
  )
}
