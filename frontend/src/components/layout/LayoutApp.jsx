import { useState } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const TITLES = {
  '/dashboard': 'Dashboard',
  '/grupos': 'Mis Grupos',
  '/nuevo-gasto': 'Nuevo Gasto',
  '/historial': 'Historial de Gastos',
  '/balances': 'Balances',
  '/perfil': 'Mi Perfil',
  '/recomendaciones': 'Recomendaciones IA',
}

export default function LayoutApp() {
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="text-gray-500">Cargando...</span></div>
  if (!user) return <Navigate to="/login" replace />

  const title = TITLES[location.pathname] || 'SplitSmart'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar escritorio */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50">
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar onMenuToggle={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
