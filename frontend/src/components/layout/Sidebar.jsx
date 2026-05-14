import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Receipt, History, ArrowLeftRight, User, Sparkles, LogOut } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import Avatar from '../ui/Avatar'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/grupos', label: 'Mis Grupos', icon: Users },
  { to: '/nuevo-gasto', label: 'Nuevo Gasto', icon: Receipt },
  { to: '/historial', label: 'Historial', icon: History },
  { to: '/balances', label: 'Balances', icon: ArrowLeftRight },
  { to: '/recomendaciones', label: 'Recomendaciones IA', icon: Sparkles },
  { to: '/perfil', label: 'Mi Perfil', icon: User },
]

export default function Sidebar({ mobile, onClose }) {
  const { user, logout } = useAuth()
  return (
    <aside className={`flex flex-col h-full bg-white border-r border-gray-200 ${mobile ? 'w-72' : 'w-64'}`}>
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">SplitSmart</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <Avatar nombre={user?.nombre} foto={user?.foto_url} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.nombre}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
