import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, Calendar, Clock, Shield, Edit, X } from 'lucide-react'
import { PageHeader } from '../components/shared/PageHeader'
import { StatusBadge } from '../components/shared/StatusBadge'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/authStore'
import { formatDate, formatRelative } from '../utils/format'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone'),
  currentPassword: z.string().optional().or(z.literal('')),
  newPassword: z.string().optional().or(z.literal('')),
})
  .refine((d) => !d.newPassword || d.newPassword.length >= 6, { message: 'New password must be at least 6 characters', path: ['newPassword'] })
  .refine((d) => !d.newPassword || !!d.currentPassword, { message: 'Enter your current password to change it', path: ['currentPassword'] })

const PERMISSION_LABELS = {
  manageUsers: 'Manage Users',
  manageDrivers: 'Manage Drivers',
  manageTrips: 'Manage Trips',
  managePayments: 'Manage Payments',
  verifyDocuments: 'Verify Documents',
  handleSupport: 'Handle Support',
  manageAdmins: 'Manage Admins',
  viewAnalytics: 'View Analytics',
  manageSubscriptions: 'Manage Subscriptions',
  manageSuppliers: 'Manage Suppliers',
}

export default function Profile() {
  const { admin, updateAdmin } = useAuthStore()
  const [editing, setEditing] = useState(false)

  const mutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (res) => {
      const updated = res?.data || res
      updateAdmin(updated)
      toast.success('Profile updated')
      setEditing(false)
    },
    onError: (err) => toast.error(err?.message || 'Failed to update profile'),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: admin?.name || '', email: admin?.email || '', phone: admin?.phone || '', currentPassword: '', newPassword: '' },
  })

  const startEdit = () => {
    reset({ name: admin?.name || '', email: admin?.email || '', phone: admin?.phone || '', currentPassword: '', newPassword: '' })
    setEditing(true)
  }

  const submit = handleSubmit((values) => {
    const payload = { name: values.name, email: values.email, phone: values.phone }
    if (values.newPassword) {
      payload.currentPassword = values.currentPassword
      payload.newPassword = values.newPassword
    }
    mutation.mutate(payload)
  })

  const isSuper = admin?.role === 'superadmin'
  const activePerms = Object.entries(PERMISSION_LABELS).filter(([key]) => isSuper || admin?.permissions?.[key])

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="View and manage your account details"
        actions={!editing && <Button icon={Edit} onClick={startEdit}>Edit Profile</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="flex justify-center mb-3">
              <Avatar src={admin?.avatarUrl} name={admin?.name} size="xl" />
            </div>
            <p className="text-lg font-bold text-gray-900">{admin?.name}</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <StatusBadge status={admin?.role} />
              <StatusBadge status={admin?.isActive ? 'active' : 'suspended'} />
            </div>
            <div className="mt-5 space-y-3 text-left">
              {[
                { icon: Mail, label: 'Email', value: admin?.email },
                { icon: Phone, label: 'Phone', value: admin?.phone },
                { icon: Clock, label: 'Last Login', value: admin?.lastLoginAt ? formatRelative(admin.lastLoginAt) : 'Never' },
                { icon: Calendar, label: 'Member Since', value: formatDate(admin?.createdAt) },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-gray-50 text-gray-500 shrink-0">
                    <row.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">{row.label}</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{row.value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: edit form OR permissions */}
        <div className="lg:col-span-2 space-y-6">
          {editing ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-gray-900">Edit Profile</h3>
                <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Full Name" error={errors.name?.message} {...register('name')} />
                  <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
                </div>
                <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Change Password (optional)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Current Password" type="password" placeholder="••••••••" error={errors.currentPassword?.message} {...register('currentPassword')} />
                    <Input label="New Password" type="password" placeholder="Min 6 characters" error={errors.newPassword?.message} {...register('newPassword')} />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1" loading={mutation.isPending}>Save Changes</Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-orange-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  My Permissions {isSuper && <span className="text-orange-600 font-medium">(Full access)</span>}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {activePerms.map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2 p-3 rounded-xl border border-orange-200 bg-orange-50">
                    <span className="text-sm font-medium text-gray-800">{label}</span>
                  </div>
                ))}
                {activePerms.length === 0 && (
                  <p className="text-sm text-gray-400 col-span-2">No permissions assigned.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
