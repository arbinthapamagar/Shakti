import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Inbox, Mail, Clock, CheckCircle2, Archive, Mic, Paperclip, Phone, Video } from 'lucide-react'
import { cn } from '../../utils/cn'
import { supportApi } from '../../api/support.api'
import toast from 'react-hot-toast'

const PERMISSION_ROWS = [
  { key: 'voiceMessages', label: 'Voice messages', icon: Mic },
  { key: 'documents', label: 'Documents', icon: Paperclip },
  { key: 'audioCall', label: 'Audio call', icon: Phone },
  { key: 'videoCall', label: 'Video call', icon: Video },
]

// Outlook-style folder rail (shared by the ticket list & detail pages). Sticky
// so it stays put while the main panel scrolls. Below the folders sits the
// GLOBAL support permissions (one setting applied to every ticket).
export function SupportFolders({ active = '' }) {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: countsRes } = useQuery({
    queryKey: ['support-counts'],
    queryFn: () => supportApi.list({ limit: 1 }),
    refetchInterval: 10000,
  })
  const counts = countsRes?.data?.counts || {}

  const { data: settingsRes } = useQuery({
    queryKey: ['support-settings'],
    queryFn: () => supportApi.settings(),
  })
  const settings = settingsRes?.data || {}

  const updateMutation = useMutation({
    mutationFn: (patch) => supportApi.updateSettings(patch),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['support-settings'] }); toast.success('Permissions updated') },
    onError: (err) => toast.error(err?.message || 'Failed to update'),
  })

  const folders = [
    { value: '', label: 'All', icon: Inbox, count: counts.all },
    { value: 'open', label: 'New', icon: Mail, count: counts.open },
    { value: 'in_progress', label: 'Progress', icon: Clock, count: counts.in_progress },
    { value: 'resolved', label: 'Resolved', icon: CheckCircle2, count: counts.resolved },
    { value: 'closed', label: 'Closed', icon: Archive, count: counts.closed },
  ]

  return (
    <aside className="w-52 shrink-0 sticky top-6 self-start space-y-3">
      {/* Folders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
        {folders.map((f) => {
          const isActive = active === f.value
          return (
            <button
              key={f.value || 'all'}
              onClick={() => navigate(f.value ? `/support?status=${f.value}` : '/support')}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5',
                isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              )}
            >
              <f.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-gray-400')} />
              <span className="flex-1 text-left">{f.label}</span>
              {f.count > 0 && (
                <span className={cn(
                  'min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center',
                  isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
                )}>
                  {f.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Global permissions (applies to every ticket) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Permissions</p>
        <p className="text-[11px] text-gray-400 mb-2.5">Applies to all tickets. Text chat is always on.</p>
        {PERMISSION_ROWS.map(({ key, label, icon: Icon }) => {
          const on = !!settings[key]
          return (
            <div key={key} className="flex items-center gap-2 py-1.5">
              <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="flex-1 text-sm text-gray-700">{label}</span>
              <button
                type="button"
                onClick={() => updateMutation.mutate({ [key]: !on })}
                disabled={updateMutation.isPending}
                title={on ? 'Disable' : 'Enable'}
                className="disabled:opacity-50"
              >
                <span className={cn('relative inline-flex h-5 w-9 items-center rounded-full transition-colors', on ? 'bg-emerald-500' : 'bg-gray-300')}>
                  <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform', on ? 'translate-x-4' : 'translate-x-0.5')} />
                </span>
              </button>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
