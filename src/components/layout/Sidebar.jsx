import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Tag, CalendarDays, Sprout, X, ChevronLeft, UserCog } from 'lucide-react'

const NAV = [
  { to: '/', label: 'לוח בקרה', Icon: LayoutDashboard, end: true },
]

const ADMIN_NAV = [
  { to: '/admin/season-setup', label: 'הגדרת עונה', Icon: CalendarDays },
  { to: '/admin/employees', label: 'עובדים', Icon: Users },
  { to: '/admin/spray-types', label: 'סוגי ריסוס', Icon: Tag },
  { to: '/admin/users', label: 'משתמשי מערכת', Icon: UserCog },
]

function NavItem({ to, label, Icon, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-green-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 z-40 flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sprout size={18} className="text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">GreenCrop</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="h-10 w-auto object-contain" alt="משק מנשה" />
            <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-gray-100">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} onClick={onClose} />
          ))}

          <div className="pt-4 pb-1">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <ChevronLeft size={12} /> ניהול
            </p>
          </div>

          {ADMIN_NAV.map((item) => (
            <NavItem key={item.to} {...item} onClick={onClose} />
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            כל פתח: 8מ × 48מ = 384 מ"ר
          </p>
        </div>
      </aside>
    </>
  )
}
