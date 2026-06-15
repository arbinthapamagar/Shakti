import { cn } from '../../utils/cn'

export function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={cn('flex gap-1 border-b border-gray-200', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            active === tab.value
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          {tab.label}
          {tab.count != null && (
            <span
              className={cn(
                'ml-2 rounded-full px-2 py-0.5 text-xs',
                active === tab.value ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
