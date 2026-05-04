import { Menu, LogOut, FlaskConical } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/': 'לוח בקרה',
  '/admin/season-setup': 'הגדרת עונה',
  '/admin/employees': 'עובדים',
  '/admin/spray-types': 'סוגי ריסוס',
}

export default function Header({ onMenuClick }) {
  const { user, logout, isDemo } = useAuth()
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'GreenCrop'

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        {isDemo && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5">
            <FlaskConical size={12} />
            מצב הדגמה
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-xs font-medium text-gray-700">{user?.email}</p>
          {isDemo && <p className="text-xs text-gray-400">Supabase לא מחובר</p>}
        </div>
        <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center">
          <span className="text-xs font-bold text-green-700">
            {user?.email?.[0]?.toUpperCase() || 'D'}
          </span>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
