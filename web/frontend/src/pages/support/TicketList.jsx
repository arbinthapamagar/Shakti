import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { DataTable } from '../../components/shared/DataTable'
import { Pagination } from '../../components/shared/Pagination'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageHeader } from '../../components/shared/PageHeader'
import { FilterBar } from '../../components/shared/FilterBar'
import { Tabs } from '../../components/ui/Tabs'
import { Avatar } from '../../components/ui/Avatar'
import { supportApi } from '../../api/support.api'
import { formatRelative, formatDate } from '../../utils/format'

const CATEGORY_OPTIONS = [
  { value: 'trip_issue', label: 'Trip Issue' },
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'driver_complaint', label: 'Driver Complaint' },
  { value: 'rider_complaint', label: 'Rider Complaint' },
  { value: 'document_issue', label: 'Document Issue' },
  { value: 'subscription_issue', label: 'Subscription' },
  { value: 'account_issue', label: 'Account Issue' },
  { value: 'other', label: 'Other' },
]

export default function TicketList() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [statusTab, setStatusTab] = useState('open')
  const [category, setCategory] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['support', page, statusTab, category],
    queryFn: () => supportApi.list({ page, limit: 20, status: statusTab || undefined, category: category || undefined }),
    keepPreviousData: true,
  })

  const tickets = data?.data?.tickets || data?.data || []
  const pagination = data?.data?.pagination || { total: 0, totalPages: 1 }

  const tabs = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
    { value: '', label: 'All' },
  ]

  const columns = [
    {
      key: '_id',
      header: 'Ticket',
      render: (val, row) => (
        <div>
          <p className="text-sm font-medium text-gray-900 max-w-[200px] truncate">{row.subject}</p>
          <p className="text-xs font-mono text-gray-400">#{val?.slice(-8).toUpperCase()}</p>
        </div>
      ),
    },
    {
      key: 'userId',
      header: 'From',
      render: (val, row) => {
        const person = val || row.driverId
        return (
          <div className="flex items-center gap-2">
            <Avatar name={person?.name} size="sm" />
            <div>
              <p className="text-sm font-medium text-gray-800">{person?.name || '—'}</p>
              <p className="text-xs text-gray-400">{val ? 'Rider' : 'Driver'}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'category',
      header: 'Category',
      render: (val) => (
        <span className="text-xs capitalize bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {val?.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      render: (val) => val?.name ? (
        <div className="flex items-center gap-1.5">
          <Avatar name={val.name} size="xs" />
          <span className="text-xs">{val.name}</span>
        </div>
      ) : <span className="text-xs text-gray-400 italic">Unassigned</span>,
    },
    {
      key: 'messages',
      header: 'Messages',
      render: (val) => <span className="text-sm text-gray-600">{val?.length || 0}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (val) => (
        <div>
          <p className="text-xs text-gray-600">{formatDate(val, 'MMM dd, yyyy')}</p>
          <p className="text-xs text-gray-400">{formatRelative(val)}</p>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Support Tickets" description="Manage user and driver support requests" />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 pt-4">
          <Tabs tabs={tabs} active={statusTab} onChange={(v) => { setStatusTab(v); setPage(1) }} />
        </div>
        <div className="px-5 py-4 border-b border-gray-50">
          <FilterBar
            filters={[
              {
                placeholder: 'All Categories',
                value: category,
                onChange: (v) => { setCategory(v); setPage(1) },
                options: CATEGORY_OPTIONS,
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={tickets}
          isLoading={isLoading}
          emptyTitle="No tickets found"
          emptyDesc="No support tickets match your filters"
          onRowClick={(row) => navigate(`/support/${row._id}`)}
        />

        {pagination.total > 0 && (
          <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} limit={20} onPageChange={setPage} />
        )}
      </div>
    </div>
  )
}
