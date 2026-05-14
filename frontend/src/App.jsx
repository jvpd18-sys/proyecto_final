import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import LayoutApp from './components/layout/LayoutApp'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Grupos from './pages/Grupos'
import GrupoDetalle from './pages/GrupoDetalle'
import NuevoGasto from './pages/NuevoGasto'
import Historial from './pages/Historial'
import Balances from './pages/Balances'
import Perfil from './pages/Perfil'
import RecomendacionesIA from './pages/RecomendacionesIA'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<LayoutApp />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/grupos" element={<Grupos />} />
            <Route path="/grupos/:id" element={<GrupoDetalle />} />
            <Route path="/nuevo-gasto" element={<NuevoGasto />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/balances" element={<Balances />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/recomendaciones" element={<RecomendacionesIA />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
