import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, ZoomIn, FileText } from 'lucide-react'
import { Tabs } from '../../components/ui/Tabs'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Input'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageHeader } from '../../components/shared/PageHeader'
import { TableSpinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { Avatar } from '../../components/ui/Avatar'
import { documentsApi } from '../../api/documents.api'
import { formatDate, formatRelative } from '../../utils/format'
import toast from 'react-hot-toast'

const isPdf = (url) => /\.pdf(\?|$)/i.test(url || '')

export default function DocumentQueue() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('pending')
  const [lightbox, setLightbox] = useState(null)
  const [rejectDoc, setRejectDoc] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['documents', tab],
    queryFn: () => documentsApi.list({ status: tab }),
  })

  const verify = useMutation({
    mutationFn: (id) => documentsApi.verify(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['documents'] }); toast.success('Document verified') },
    onError: (err) => toast.error(err?.message || 'Failed'),
  })

  const reject = useMutation({
    mutationFn: ({ id, reason }) => documentsApi.reject(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document rejected')
      setRejectDoc(null)
      setRejectReason('')
    },
    onError: (err) => toast.error(err?.message || 'Failed'),
  })

  const docs = data?.data?.documents || data?.data || []

  const tabs = [
    { value: 'pending', label: 'Pending', count: tab === 'pending' ? docs.length : undefined },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ]

  const DOC_TYPE_LABELS = {
    citizenship: 'Citizenship',
    driving_license: 'Driving License',
    police_clearance: 'Police Clearance',
    vehicle_registration: 'Vehicle Registration',
    insurance: 'Insurance',
    bluebook: 'Bluebook',
    profile_photo: 'Profile Photo',
    vehicle_photo: 'Vehicle Photo',
  }

  return (
    <div>
      <PageHeader title="Document Verification" description="Review and verify driver documents" />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 pt-4">
          <Tabs tabs={tabs} active={tab} onChange={setTab} />
        </div>

        {isLoading ? (
          <TableSpinner />
        ) : docs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={`No ${tab} documents`}
            description={tab === 'pending' ? 'All documents have been reviewed' : `No ${tab} documents found`}
          />
        ) : (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {docs.map((doc) => (
              <div key={doc._id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                {/* Document image / PDF */}
                <div className="relative h-44 bg-gray-50 group">
                  {doc.fileUrl && isPdf(doc.fileUrl) ? (
                    <button
                      onClick={() => setLightbox(doc)}
                      className="flex flex-col items-center justify-center h-full w-full gap-2 hover:bg-gray-100 transition-colors"
                    >
                      <FileText className="h-12 w-12 text-orange-500" />
                      <span className="text-xs font-medium text-gray-600">PDF Document — click to view</span>
                    </button>
                  ) : doc.fileUrl ? (
                    <>
                      <img
                        src={doc.fileUrl}
                        alt={doc.type}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => setLightbox(doc)}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all"
                      >
                        <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileText className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <StatusBadge status={doc.status} />
                  </div>
                </div>

                {/* Doc info */}
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-800 mb-1">
                    {DOC_TYPE_LABELS[doc.type] || doc.type}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar name={doc.driverId?.userId?.name} size="xs" />
                    <span className="text-xs text-gray-500">{doc.driverId?.userId?.name || '—'}</span>
                  </div>
                  {doc.expiresAt && (
                    <p className="text-xs text-gray-400 mb-2">Expires: {formatDate(doc.expiresAt)}</p>
                  )}
                  <p className="text-xs text-gray-400 mb-3">{formatRelative(doc.createdAt)}</p>

                  {doc.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => verify.mutate(doc._id)}
                        disabled={verify.isPending}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Verify
                      </button>
                      <button
                        onClick={() => setRejectDoc(doc)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  )}

                  {doc.status === 'rejected' && doc.rejectionReason && (
                    <div className="bg-red-50 rounded-lg p-2">
                      <p className="text-xs text-red-600">Reason: {doc.rejectionReason}</p>
                    </div>
                  )}

                  {doc.status === 'approved' && doc.verifiedAt && (
                    <p className="text-xs text-emerald-600">Verified {formatRelative(doc.verifiedAt)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">{DOC_TYPE_LABELS[lightbox.type] || lightbox.type}</h3>
              <button onClick={() => setLightbox(null)} className="text-white/60 hover:text-white text-2xl">×</button>
            </div>
            {isPdf(lightbox.fileUrl) ? (
              <iframe
                src={lightbox.fileUrl}
                title={lightbox.type}
                className="w-full rounded-xl bg-white h-[75vh]"
              />
            ) : (
              <img src={lightbox.fileUrl} alt={lightbox.type} className="w-full rounded-xl max-h-[80vh] object-contain" />
            )}
            {lightbox.status === 'pending' && (
              <div className="flex gap-3 mt-4">
                <Button variant="success" className="flex-1" onClick={() => { verify.mutate(lightbox._id); setLightbox(null) }} loading={verify.isPending}>
                  Verify Document
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => { setRejectDoc(lightbox); setLightbox(null) }}>
                  Reject Document
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject reason modal */}
      <Modal open={!!rejectDoc} onClose={() => { setRejectDoc(null); setRejectReason('') }} title="Reject Document" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Rejecting: <strong>{DOC_TYPE_LABELS[rejectDoc?.type] || rejectDoc?.type}</strong>
          </p>
          <Textarea
            label="Rejection Reason"
            placeholder="Explain why this document is being rejected..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setRejectDoc(null); setRejectReason('') }}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              disabled={!rejectReason.trim()}
              loading={reject.isPending}
              onClick={() => reject.mutate({ id: rejectDoc._id, reason: rejectReason })}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
