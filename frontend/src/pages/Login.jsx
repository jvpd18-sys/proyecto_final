import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Login() {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nombre: '', email: '', password: '', password2: '' })

  if (user) return <Navigate to="/dashboard" replace />

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(form.email, form.password)
      } else {
        if (form.password !== form.password2) { setError('Las contraseñas no coinciden.'); setLoading(false); return }
        await register(form.nombre, form.email, form.password, form.password2)
      }
      navigate('/dashboard')
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.error || 'Error al procesar la solicitud.'
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SplitSmart</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona tus gastos compartidos con inteligencia</p>
        </div>

        <div className="card p-8">
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                {t === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <Input label="Nombre completo" type="text" placeholder="Tu nombre" value={form.nombre} onChange={set('nombre')} required />
            )}
            <Input label="Correo electrónico" type="email" placeholder="tu@email.com" value={form.email} onChange={set('email')} required />
            <Input label="Contraseña" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
            {tab === 'register' && (
              <Input label="Confirmar contraseña" type="password" placeholder="••••••••" value={form.password2} onChange={set('password2')} required />
            )}
            <Button type="submit" variant="primary" loading={loading} className="w-full justify-center">
              {tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
