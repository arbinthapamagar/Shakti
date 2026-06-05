import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle, XCircle, ExternalLink, Star, Car, User, FileText, TrendingUp } from 'lucide-react'
import { Tabs } from '../../components/ui/Tabs'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { TableSpinner } from '../../components/ui/Spinner'
import { driversApi } from '../../api/drivers.api'
import { documentsApi } from '../../api/documents.api'
import { formatDate, formatCurrency, formatRelative } from '../../utils/format'
import toast from 'react-hot-toast'

export default function DriverDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('profile')
  const [lightboxUrl, setLightboxUrl] = useState(null)

  const { data: driverRes, isLoading } = useQuery({
    queryKey: ['driver', id],
    queryFn: () => driversApi.get(id),
  })

  const { data: docsRes, isLoading: docsLoading } = useQuery({
    queryKey: ['driver-docs', id],
    queryFn: () => driversApi.documents(id),
    enabled: activeTab === 'documents',
  })

  const updateStatus = useMutation({
    mutationFn: (status) => driversApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['driver', id] }); toast.success('Status updated') },
    onError: (err) => toast.error(err?.message || 'Failed'),
  })

  const verifyDoc = useMutation({
    mutationFn: (docId) => documentsApi.verify(docId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['driver-docs', id] }); toast.success('Document verified') },
    onError: (err) => toast.error(err?.message || 'Failed'),
  })

  const rejectDoc = useMutation({
    mutationFn: ({ docId, reason }) => documentsApi.reject(docId, reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['driver-docs', id] }); toast.success('Document rejected') },
    onError: (err) => toast.error(err?.message || 'Failed'),
  })

  const driverPayload = driverRes?.data
  const driver = driverPayload?.driver || driverPayload
  const docs = docsRes?.data || driverPayload?.documents || []

  const tabs = [
    { value: 'profile', label: 'Profile' },
    { value: 'vehicle', label: 'Vehicle' },
    { value: 'documents', label: 'Documents' },
    { value: 'stats', label: 'Statistics' },
  ]

  if (isLoading) return <TableSpinner />
  if (!driver) return <div className="p-6 text-gray-500">Driver not found.</div>

  const user = driver.userId

  return (
    <div>
      {/* Back + Actions header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Drivers
        </button>
        <div className="flex items-center gap-2">
          {driver.status === 'pending' && (
            <>
              <Button
                variant="success"
                size="sm"
                icon={CheckCircle}
                onClick={() => updateStatus.mutate('approved')}
                loading={updateStatus.isPending}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                onClick={() => updateStatus.mutate('rejected')}
                loading={updateStatus.isPending}
              >
                Reject
              </Button>
            </>
          )}
          {driver.status === 'approved' && (
            <Button variant="warning" size="sm" onClick={() => updateStatus.mutate('suspended')} loading={updateStatus.isPending}>
              Suspend
            </Button>
          )}
          {driver.status === 'suspended' && (
            <Button variant="success" size="sm" onClick={() => updateStatus.mutate('approved')} loading={updateStatus.isPending}>
              Reactivate
            </Button>
          )}
        </div>
      </div>

      {/* Driver card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-5">
          <Avatar src={user?.avatarUrl} name={user?.name} size="xl" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user?.name || '—'}</h2>
                <p className="text-sm text-gray-500">{user?.phone}</p>
                {user?.email && <p className="text-sm text-gray-400">{user.email}</p>}
              </div>
              <div className="flex gap-2">
                <StatusBadge status={driver.status} />
                {driver.isVerified && <Badge variant="success">Verified</Badge>}
                <StatusBadge status={driver.isOnline ? 'online' : 'offline'} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4">
              {[
                { label: 'Total Rides', value: driver.totalRides?.toLocaleString() || '0', icon: Car },
                { label: 'Rating', value: `${(driver.rating || 0).toFixed(1)} ⭐`, icon: Star },
                { label: 'Total Earnings', value: formatCurrency(driver.earnings || 0), icon: TrendingUp },
                { label: 'Cancelled', value: driver.cancelledRides || 0, icon: XCircle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 pt-4">
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'License Number', value: driver.licenseNumber },
                { label: 'License Expiry', value: formatDate(driver.licenseExpiry) },
                { label: 'Vehicle Capacity', value: driver.vehicleCapacity },
                { label: 'Last Active', value: formatRelative(driver.lastActiveAt) },
                { label: 'Member Since', value: formatDate(driver.createdAt) },
                { label: 'Currently On Ride', value: driver.isOnRide ? 'Yes' : 'No' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'vehicle' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Vehicle Type', value: driver.vehicleType },
                { label: 'Vehicle Plate', value: driver.vehiclePlate },
                { label: 'Vehicle Model', value: driver.vehicleModel },
                { label: 'Vehicle Color', value: driver.vehicleColor },
                { label: 'Vehicle Year', value: driver.vehicleYear },
                { label: 'Capacity', value: driver.vehicleCapacity },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-800 capitalize">{value || '—'}</p>
                </div>
              ))}
              {driver.documents?.vehicleImage && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-2">Vehicle Photo</p>
                  <img
                    src={driver.documents.vehicleImage}
                    alt="Vehicle"
                    className="h-40 w-full object-cover rounded-lg cursor-pointer"
                    onClick={() => setLightboxUrl(driver.documents.vehicleImage)}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              {docsLoading ? <TableSpinner /> : (
                <div className="grid grid-cols-2 gap-4">
                  {docs.length === 0 && (
                    <p className="col-span-2 text-sm text-gray-400 text-center py-8">No documents uploaded</p>
                  )}
                  {docs.map((doc) => (
                    <div key={doc._id} className="border border-gray-100 rounded-xl overflow-hidden">
                      <div className="relative h-40 bg-gray-50">
                        {doc.fileUrl ? (
                          <img
                            src={doc.fileUrl}
                            alt={doc.type}
                            className="h-full w-full object-cover cursor-pointer hover:opacity-90"
                            onClick={() => setLightboxUrl(doc.fileUrl)}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <FileText className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <StatusBadge status={doc.status} />
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-800 capitalize">{doc.type?.replace(/_/g, ' ')}</p>
                        {doc.expiresAt && (
                          <p className="text-xs text-gray-400">Expires: {formatDate(doc.expiresAt)}</p>
                        )}
                        {doc.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => verifyDoc.mutate(doc._id)}
                              className="flex-1 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => rejectDoc.mutate({ docId: doc._id, reason: 'Document unclear' })}
                              className="flex-1 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {doc.rejectionReason && (
                          <p className="text-xs text-red-500 mt-1">Reason: {doc.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Rides Completed', value: driver.totalRides?.toLocaleString() || '0' },
                { label: 'Cancelled Rides', value: driver.cancelledRides || 0 },
                { label: 'Average Rating', value: `${(driver.rating || 0).toFixed(2)} / 5.00` },
                { label: 'Total Ratings Received', value: driver.totalRatings || 0 },
                { label: 'Total Earnings', value: formatCurrency(driver.earnings || 0) },
                { label: 'Pool Assignments', value: driver.poolAssignments?.length || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="Document" className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" />
        </div>
      )}
    </div>
  )
}
