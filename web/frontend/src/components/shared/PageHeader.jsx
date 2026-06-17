export function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="flex items-start justify-between mb-4 gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="font-display text-2xl sm:text-[28px] font-extrabold text-gray-900 leading-[1.05]">{title}</h1>
        <span className="hand-rule mt-2.5" />
        {description && <p className="mt-3 text-sm text-gray-500 max-w-prose">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0 pt-1">{actions}</div>}
    </div>
  )
}
