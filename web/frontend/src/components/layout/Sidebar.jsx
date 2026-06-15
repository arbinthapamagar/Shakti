import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Car, Navigation, Repeat, CreditCard, FileText,
  MessageSquare, Building2, BarChart2, Shield, Bell, ChevronRight, Zap, X
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAuthStore, hasPermission } from '../../store/authStore'

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: null },
      { to: '/analytics', label: 'Analytics', icon: BarChart2, permission: 'viewAnalytics' },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/users', label: 'Users', icon: Users, permission: 'manageUsers' },
      { to: '/drivers', label: 'Drivers', icon: Car, permission: 'manageDrivers' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/trips', label: 'Trips', icon: Navigation, permission: 'manageTrips' },
      { to: '/subscriptions', label: 'Subscriptions', icon: Repeat, permission: 'manageSubscriptions' },
      { to: '/documents', label: 'Documents', icon: FileText, permission: 'verifyDocuments' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/transactions', label: 'Transactions', icon: CreditCard, permission: 'managePayments' },
    ],
  },
  {
    label: 'Support & Business',
    items: [
      { to: '/support', label: 'Support', icon: MessageSquare, permission: 'handleSupport' },
      { to: '/suppliers', label: 'Suppliers', icon: Building2, permission: 'manageSuppliers' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/notifications', label: 'Notifications', icon: Bell, permission: null },
      { to: '/admins', label: 'Admin Users', icon: Shield, permission: 'manageAdmins' },
    ],
  },
]

export function Sidebar({ open, onClose }) {
  const { admin } = useAuthStore()

  return (
    <>
      {/* Desktop: always visible fixed sidebar */}
      {/* Mobile: slide-in drawer controlled by `open` prop */}
      <aside
        className={cn(
          'bg-white text-gray-900 flex flex-col h-screen fixed left-0 top-0 z-30 w-60 transition-transform duration-200 border-r border-gray-200',
          // Desktop — always shown
          'lg:translate-x-0',
          // Mobile — shown only when open
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo + mobile close */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-200">
          <div className="bg-orange-500 rounded-lg p-1.5">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-base leading-tight">Shakti</p>
            <p className="text-orange-600 text-xs">Admin Portal</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-orange-50 text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !item.permission || hasPermission(admin, item.permission)
            )
            if (!visibleItems.length) return null
            return (
              <div key={section.label} className="mb-5">
                <p className="px-5 mb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.label}
                </p>
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors group',
                        isActive
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-gray-400 group-hover:text-orange-600')} />
                        <span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>

        {/* Admin info */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{admin?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 capitalize">{admin?.role || 'admin'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
