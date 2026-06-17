import { cn } from '../../utils/cn'

// Ink-stamp labels: mono, uppercase, a hand-cut (slightly irregular) outline.
const variants = {
  default: 'bg-stone-100 text-stone-600 border-stone-300/60',
  primary: 'bg-orange-50 text-orange-700 border-orange-300/70',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-300/70',
  warning: 'bg-amber-50 text-amber-700 border-amber-300/70',
  danger: 'bg-red-50 text-red-700 border-red-300/70',
  info: 'bg-orange-50 text-orange-700 border-orange-300/70',
  purple: 'bg-orange-50 text-orange-700 border-orange-300/70',
}

export function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap',
        variants[variant],
        className
      )}
      style={{ borderRadius: '7px 4px 6px 5px' }}
    >
      {children}
    </span>
  )
}
