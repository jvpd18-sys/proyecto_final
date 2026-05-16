import { useState, useRef } from 'react'
import { Camera } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../auth/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Avatar from '../components/ui/Avatar'

export default function Perfil() {
  const { user, updateUser, logout } = useAuth()
  const [form, setForm] = useState({ nombre: user?.nombre || '' })
  const [passForm, setPassForm] = useState({ password_actual: '', password_nuevo: '', password_nuevo2: '' })
  const [guardando, setGuardando] = useState(false)
  const [guardandoPass, setGuardandoPass] = useState(false)
  const [msgPerfil, setMsgPerfil] = useState('')
  const [msgPass, setMsgPass] = useState('')
  const fileRef = useRef()

  const guardarPerfil = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setMsgPerfil('')
    try {
      const { data } = await api.put('/auth/me/', form)
      updateUser(data)
      setMsgPerfil('Perfil actualizado correctamente.')
    } catch { setMsgPerfil('Error al actualizar el perfil.') } finally { setGuardando(false) }
  }

  const cambiarFoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('foto_url', file)
    const { data } = await api.put('/auth/me/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    updateUser(data)
  }

  const cambiarPassword = async (e) => {
    e.preventDefault()
    setGuardandoPass(true)
    setMsgPass('')
    try {
      await api.post('/auth/me/password/', passForm)
      setMsgPass('Contraseña actualizada correctamente.')
      setPassForm({ password_actual: '', password_nuevo: '', password_nuevo2: '' })
    } catch (err) { setMsgPass(err.response?.data?.detail || 'Error al cambiar la contraseña.') } finally { setGuardandoPass(false) }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card>
        <div className="flex flex-col items-center gap-4 pb-4 border-b border-gray-100">
          <div className="relative">
            <Avatar nombre={user?.nombre} foto={user?.foto_url} size="xl" />
            <button onClick={() => fileRef.current.click()} className="absolute bottom-0 right-0 h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">
              <Camera className="h-4 w-4 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={cambiarFoto} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">{user?.nombre}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={guardarPerfil} className="space-y-4 pt-4">
          <Input label="Nombre completo" value={form.nombre} onChange={(e) => setForm({ nombre: e.target.value })} required />
          <Input label="Correo electrónico" value={user?.email} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
          {msgPerfil && <p className={`text-sm ${msgPerfil.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{msgPerfil}</p>}
          <Button type="submit" loading={guardando} className="w-full justify-center">Guardar cambios</Button>
        </form>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Cambiar contraseña</h3>
        <form onSubmit={cambiarPassword} className="space-y-4">
          <Input label="Contraseña actual" type="password" value={passForm.password_actual} onChange={(e) => setPassForm((f) => ({ ...f, password_actual: e.target.value }))} required />
          <Input label="Nueva contraseña" type="password" value={passForm.password_nuevo} onChange={(e) => setPassForm((f) => ({ ...f, password_nuevo: e.target.value }))} required />
          <Input label="Confirmar nueva contraseña" type="password" value={passForm.password_nuevo2} onChange={(e) => setPassForm((f) => ({ ...f, password_nuevo2: e.target.value }))} required />
          {msgPass && <p className={`text-sm ${msgPass.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{msgPass}</p>}
          <Button type="submit" loading={guardandoPass} className="w-full justify-center">Cambiar contraseña</Button>
        </form>
      </Card>

      <Card>
        <Button variant="danger" className="w-full justify-center" onClick={logout}>Cerrar sesión</Button>
      </Card>
    </div>
  )
}
