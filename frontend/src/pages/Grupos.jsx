import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import api from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import EmptyState from '../components/ui/EmptyState'
import { formatDate } from '../utils/format'

export default function Grupos() {
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '' })
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { api.get('/groups/').then(({ data }) => setGrupos(data)).finally(() => setLoading(false)) }, [])

  const crearGrupo = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.post('/groups/', form)
      setGrupos((g) => [data, ...g])
      setModal(false)
      setForm({ nombre: '', descripcion: '' })
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{grupos.length} grupo{grupos.length !== 1 ? 's' : ''}</p>
        <Button onClick={() => setModal(true)}><Plus className="h-4 w-4" />Nuevo grupo</Button>
      </div>

      {grupos.length === 0 ? (
        <EmptyState icono={Users} mensaje="Aún no tienes grupos. ¡Crea el primero!" accion={<Button onClick={() => setModal(true)}>Crear grupo</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.map((g) => (
            <Card key={g.id} onClick={() => navigate(`/grupos/${g.id}`)}>
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-lg">{g.nombre[0]}</span>
                </div>
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">{g.nombre}</h3>
              {g.descripcion && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{g.descripcion}</p>}
              <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                <Users className="h-3.5 w-3.5" />
                <span>{g.total_miembros} miembro{g.total_miembros !== 1 ? 's' : ''}</span>
                <span className="mx-1">·</span>
                <span>Creado {formatDate(g.creado_en)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Nuevo grupo">
        <form onSubmit={crearGrupo} className="space-y-4">
          <Input label="Nombre del grupo" placeholder="Ej: Apartamento 302" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} required />
          <div>
            <label className="label">Descripción (opcional)</label>
            <textarea className="input" rows={3} placeholder="Propósito del grupo..." value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Crear grupo</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
