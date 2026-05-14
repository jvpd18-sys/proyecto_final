import { Menu } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import Avatar from '../ui/Avatar'

export default function Topbar({ onMenuToggle, title }) {
  const { user } = useAuth()
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <Avatar nombre={user?.nombre} foto={user?.foto_url} size="sm" />
      </div>
    </header>
  )
}
