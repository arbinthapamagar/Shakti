// Flat card (no shadow) used to group controls.
export function Card({ title, icon: Icon, right, children, className }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className || ''}`}>
      {(title || right) && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-orange-600" />}
            {title && <h3 className="text-sm font-semibold text-gray-800">{title}</h3>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  )
}

// Flat teal slider with an inline value. Used across the pricing dashboard.
export function Slider({ label, value, min, max, step = 0.1, onChange, format, suffix, hint }) {
  const v = Number(value) || 0
  const pct = max > min ? ((v - min) / (max - min)) * 100 : 0
  return (
    <div>
      {(label || format) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          <span className="text-sm font-semibold text-orange-600 tabular-nums">
            {format ? format(v) : v}{suffix}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="ev-slider w-full"
        style={{ background: `linear-gradient(to right, #ea580c ${pct}%, #e5e7eb ${pct}%)` }}
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {hint && <span className="block text-xs text-gray-400">{hint}</span>}
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full shrink-0 relative transition-colors ${checked ? 'bg-orange-600' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </label>
  )
}

export function Field({ label, value, onChange, type = 'number', min, step, placeholder, className }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>}
      <input
        type={type}
        value={value}
        min={min}
        step={step}
        placeholder={placeholder}
        onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? '' : parseFloat(e.target.value)) : e.target.value)}
        className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${className || ''}`}
      />
    </label>
  )
}
