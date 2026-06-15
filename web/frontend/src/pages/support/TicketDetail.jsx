import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, CheckCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { Avatar } from '../../components/ui/Avatar'
import { TableSpinner } from '../../components/ui/Spinner'
import { supportApi } from '../../api/support.api'
import { formatDateTime, formatRelative } from '../../utils/format'
import toast from 'react-hot-toast'

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [message, setMessage] = useState('')

  const { data: ticketRes, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => supportApi.get(id),
  })

  const replyMutation = useMutation({
    mutationFn: (msg) => supportApi.reply(id, msg),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ticket', id] }); setMessage(''); toast.success('Reply sent') },
    onError: (err) => toast.error(err?.message || 'Failed to send reply'),
  })

  const updateStatus = useMutation({
    mutationFn: (status) => supportApi.update(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ticket', id] }); toast.success('Ticket updated') },
    onError: (err) => toast.error(err?.message || 'Failed'),
  })

  const ticket = ticketRes?.data

  if (isLoading) return <TableSpinner />
  if (!ticket) return <div className="p-6 text-gray-500">Ticket not found.</div>

  const person = ticket.userId || ticket.driverId

  const CATEGORY_LABELS = {
    trip_issue: 'Trip Issue', payment_issue: 'Payment Issue', driver_complaint: 'Driver Complaint',
    rider_complaint: 'Rider Complaint', document_issue: 'Document Issue', subscription_issue: 'Subscription Issue',
    account_issue: 'Account Issue', other: 'Other',
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to Tickets
        </button>
        <div className="flex items-center gap-2">
          {ticket.status === 'open' && (
            <Button size="sm" variant="warning" onClick={() => updateStatus.mutate('in_progress')} loading={updateStatus.isPending}>
              Start Progress
            </Button>
          )}
          {ticket.status === 'in_progress' && (
            <Button size="sm" variant="success" icon={CheckCircle} onClick={() => updateStatus.mutate('resolved')} loading={updateStatus.isPending}>
              Resolve
            </Button>
          )}
          {ticket.status === 'resolved' && (
            <Button size="sm" variant="secondary" onClick={() => updateStatus.mutate('closed')} loading={updateStatus.isPending}>
              Close
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Thread */}
        <div className="col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">{ticket.subject}</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  #{ticket._id?.slice(-8).toUpperCase()} · {CATEGORY_LABELS[ticket.category] || ticket.category}
                </p>
              </div>
              <StatusBadge status={ticket.status} />
            </div>

            {/* Messages */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
              {ticket.messages?.map((msg, i) => {
                const isAdmin = msg.senderType === 'admin'
                return (
                  <div key={i} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                    <Avatar
                      name={isAdmin ? 'Admin' : person?.name}
                      size="sm"
                    />
                    <div className={`max-w-[75%] ${isAdmin ? 'items-end' : ''} flex flex-col`}>
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm ${
                          isAdmin
                            ? 'bg-orange-600 text-white rounded-tr-sm'
                            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                        }`}
                      >
                        {msg.message}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{formatRelative(msg.createdAt)}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Reply box */}
            {['open', 'in_progress'].includes(ticket.status) && (
              <div className="mt-4 pt-4 border-t border-gray-50">
                <div className="flex gap-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey && message.trim()) {
                        replyMutation.mutate(message)
                      }
                    }}
                  />
                  <button
                    onClick={() => message.trim() && replyMutation.mutate(message)}
                    disabled={!message.trim() || replyMutation.isPending}
                    className="self-end px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Ctrl+Enter to send</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Submitted By</h3>
            <div className="flex items-center gap-3">
              <Avatar name={person?.name} size="md" />
              <div>
                <p className="font-semibold text-gray-900">{person?.name || '—'}</p>
                <p className="text-xs text-gray-400">{person?.phone}</p>
                <p className="text-xs text-gray-400">{ticket.userId ? 'Rider' : 'Driver'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Status', value: <StatusBadge status={ticket.status} /> },
                { label: 'Category', value: CATEGORY_LABELS[ticket.category] },
                { label: 'Created', value: formatDateTime(ticket.createdAt) },
                { label: 'Updated', value: formatRelative(ticket.updatedAt) },
                { label: 'Assigned To', value: ticket.assignedTo?.name || 'Unassigned' },
                ticket.resolvedAt && { label: 'Resolved At', value: formatDateTime(ticket.resolvedAt) },
                ticket.tripId && { label: 'Trip Ref', value: `#${ticket.tripId?.slice(-8).toUpperCase()}` },
              ].filter(Boolean).map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-2">
                  <span className="text-gray-400 shrink-0">{label}</span>
                  <span className="font-medium text-gray-800 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
