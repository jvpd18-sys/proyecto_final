import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, UserPlus, Trash2 } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../auth/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import EmptyState from '../components/ui/EmptyState'
import { formatCurrency, formatDate } from '../utils/format'

const TABS = ['Gastos', 'Balances', 'Miembros']

export default function GrupoDetalle() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [grupo, setGrupo] = useState(null)
  const [miembros, setMiembros] = useState([])
  const [gastos, setGastos] = useState([])
  const [balances, setBalances] = useState([])
  const [liquidacion, setLiquidacion] = useState([])
  const [tab, setTab] = useState('Gastos')
  const [modalInvitar, setModalInvitar] = useState(false)
  const [emailInvitar, setEmailInvitar] = useState('')
  const [invitando, setInvitando] = useState(false)
  const [msgInvitar, setMsgInvitar] = useState('')

  useEffect(() => {
    Promise.all([
      api.get(`/groups/${id}/`),
      api.get(`/groups/${id}/members/`),
      api.get(`/expenses/?group=${id}`),
      api.get(`/expenses/groups/${id}/balances/`),
      api.get(`/expenses/groups/${id}/settlement/`),
    ]).then(([g, m, ga, b, l]) => {
      setGrupo(g.data)
      setMiembros(m.data)
      setGastos(ga.data.results || ga.data)
      setBalances(b.data)
      setLiquidacion(l.data)
    })
  }, [id])

  const invitar = async (e) => {
    e.preventDefault()
    setInvitando(true)
    setMsgInvitar('')
    try {
      await api.post(`/groups/${id}/invite/`, { email: emailInvitar })
      setMsgInvitar('Miembro agregado correctamente.')
      setEmailInvitar('')
      const { data } = await api.get(`/groups/${id}/members/`)
      setMiembros(data)
    } catch (err) {
      setMsgInvitar(err.response?.data?.detail || 'Error al invitar.')
    } finally { setInvitando(false) }
  }

  const eliminarGasto = async (gastoId) => {
    if (!window.confirm('¿Eliminar este gasto?')) return
    await api.delete(`/expenses/${gastoId}/`)
    setGastos((g) => g.filter((x) => x.id !== gastoId))
  }

  if (!grupo) return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{grupo.nombre}</h2>
          {grupo.descripcion && <p className="text-sm text-gray-500 mt-0.5">{grupo.descripcion}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setModalInvitar(true)}><UserPlus className="h-4 w-4" />Invitar</Button>
          <Button onClick={() => navigate('/nuevo-gasto', { state: { grupoId: id } })}><Plus className="h-4 w-4" />Gasto</Button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t}</button>
        ))}
      </div>

      {tab === 'Gastos' && (
        gastos.length === 0 ? <EmptyState mensaje="Sin gastos en este grupo aún." /> : (
          <div className="space-y-3">
            {gastos.map((g) => (
              <Card key={g.id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{g.descripcion}</p>
                      {g.categoria && <Badge color={g.categoria.color_hex}>{g.categoria.nombre}</Badge>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(g.fecha)} · Pagó: {g.pagado_por?.nombre}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="font-semibold text-gray-900">{formatCurrency(g.monto)}</span>
                    {g.creado_por?.id === user?.id && (
                      <button onClick={() => eliminarGasto(g.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {tab === 'Balances' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Balance por miembro</h3>
            <div className="space-y-2">
              {balances.map((b) => (
                <div key={b.usuario.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <Avatar nombre={b.usuario.nombre} foto={b.usuario.foto_url} size="sm" />
                    <span className="text-sm font-medium">{b.usuario.nombre}</span>
                  </div>
                  <span className={`text-sm font-semibold ${b.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {b.balance >= 0 ? '+' : ''}{formatCurrency(b.balance)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
          {liquidacion.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Cómo liquidar las deudas</h3>
              <div className="space-y-2">
                {liquidacion.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="font-medium">{t.de?.nombre}</span>
                    <span className="text-gray-400">le paga</span>
                    <span className="font-semibold text-primary-600">{formatCurrency(t.monto)}</span>
                    <span className="text-gray-400">a</span>
                    <span className="font-medium">{t.a?.nombre}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'Miembros' && (
        <div className="space-y-2">
          {miembros.map((m) => (
            <Card key={m.id}>
              <div className="flex items-center gap-3">
                <Avatar nombre={m.usuario.nombre} foto={m.usuario.foto_url} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{m.usuario.nombre}</p>
                  <p className="text-xs text-gray-400">{m.usuario.email}</p>
                </div>
                <Badge color={m.rol === 'admin' ? '#4f46e5' : '#6b7280'}>{m.rol === 'admin' ? 'Admin' : 'Miembro'}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalInvitar} onClose={() => { setModalInvitar(false); setMsgInvitar('') }} title="Invitar miembro">
        <form onSubmit={invitar} className="space-y-4">
          <Input label="Correo del usuario" type="email" placeholder="usuario@email.com" value={emailInvitar} onChange={(e) => setEmailInvitar(e.target.value)} required />
          {msgInvitar && <p className={`text-sm ${msgInvitar.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{msgInvitar}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setModalInvitar(false)}>Cancelar</Button>
            <Button type="submit" loading={invitando}>Invitar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
