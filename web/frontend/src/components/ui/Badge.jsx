import { cn } from '../../utils/cn'

const variants = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-orange-100 text-orange-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-orange-100 text-orange-700',
  purple: 'bg-orange-100 text-orange-700',
}

export function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
