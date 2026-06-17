import { cn } from '../../utils/cn'

// Cut-paper stat tile. Numbers are set in the display face; the label is a mono
// "ledger" caption. Tiles alternate their asymmetric corners (via `index`) so a
// row of them reads hand-arranged rather than stamped from one mold.
export function StatsCard({ title, value, subtitle, icon: Icon, trend, color = 'accent', loading, index = 0 }) {
  const colorMap = {
    indigo: { bg: 'bg-orange-50', icon: 'text-orange-600' },
    accent: { bg: 'bg-orange-50', icon: 'text-orange-600' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
    red: { bg: 'bg-red-50', icon: 'text-red-600' },
    blue: { bg: 'bg-orange-50', icon: 'text-orange-600' },
    purple: { bg: 'bg-orange-50', icon: 'text-orange-600' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600' },
    teal: { bg: 'bg-orange-50', icon: 'text-orange-600' },
  }
  const c = colorMap[color] || colorMap.accent
  const alt = index % 2 === 1

  return (
    <div
      className={cn(
        'card-craft p-3.5 transition-transform duration-200 hover:-translate-y-0.5',
        alt && 'card-craft-alt'
      )}
    >
      <div className="flex items-center gap-2.5 mb-2">
        {Icon && (
          <div
            className={cn('shrink-0 p-1.5 grid place-items-center', c.bg)}
            style={{ borderRadius: alt ? '7px 12px 8px 11px' : '12px 7px 11px 8px' }}
          >
            <Icon className={cn('h-4 w-4', c.icon)} />
          </div>
        )}
        <p className="eyebrow truncate flex-1">{title}</p>
      </div>
      {loading ? (
        <div className="h-7 w-20 bg-orange-50 animate-pulse rounded" />
      ) : (
        <p className="font-display text-[26px] font-extrabold text-gray-900 leading-none truncate">{value}</p>
      )}
      {subtitle && !loading && (
        <p className={cn('mt-1.5 text-xs truncate', trend?.positive ? 'text-emerald-600' : trend?.negative ? 'text-red-500' : 'text-gray-500')}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
