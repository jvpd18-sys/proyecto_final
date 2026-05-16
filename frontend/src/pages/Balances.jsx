import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../auth/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Avatar from '../components/ui/Avatar'
import EmptyState from '../components/ui/EmptyState'
import { formatCurrency, formatDate } from '../utils/format'

export default function Balances() {
  const { user } = useAuth()
  const [pagos, setPagos] = useState([])
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [destinatario, setDestinatario] = useState(null)
  const [form, setForm] = useState({ monto: '', fecha: new Date().toISOString().split('T')[0], grupo_id: '' })
  const [guardando, setGuardando] = useState(false)

  const cargar = () => {
    Promise.all([api.get('/payments/'), api.get('/groups/')]).then(([p, g]) => {
      setPagos(p.data)
      setGrupos(g.data)
    }).finally(() => setLoading(false))
  }
  useEffect(() => { cargar() }, [])

  const debes = pagos.filter((p) => p.de_usuario?.id === user?.id && p.estado === 'pendiente')
  const teDeben = pagos.filter((p) => p.a_usuario?.id === user?.id && p.estado === 'pendiente')

  const abrirPago = (persona) => { setDestinatario(persona); setModal(true) }

  const registrarPago = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await api.post('/payments/', { ...form, monto: parseFloat(form.monto), a_usuario_id: destinatario.id, grupo_id: parseInt(form.grupo_id) })
      cargar()
      setModal(false)
    } finally { setGuardando(false) }
  }

  const confirmar = async (id) => {
    await api.post(`/payments/${id}/confirm/`)
    cargar()
  }

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Lo que debes</h2>
          {debes.length === 0 ? <EmptyState mensaje="No tienes deudas pendientes 🎉" /> : (
            <div className="space-y-3">
              {debes.map((p) => (
                <Card key={p.id}>
                  <div className="flex items-center gap-3">
                    <Avatar nombre={p.a_usuario?.nombre} foto={p.a_usuario?.foto_url} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{p.a_usuario?.nombre}</p>
                      <p className="text-xs text-gray-400">{formatDate(p.fecha)}</p>
                    </div>
                    <span className="font-semibold text-red-600">{formatCurrency(p.monto)}</span>
                    <Button size="sm" onClick={() => abrirPago(p.a_usuario)}>Pagar</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Lo que te deben</h2>
          {teDeben.length === 0 ? <EmptyState mensaje="Nadie te debe dinero por ahora." /> : (
            <div className="space-y-3">
              {teDeben.map((p) => (
                <Card key={p.id}>
                  <div className="flex items-center gap-3">
                    <Avatar nombre={p.de_usuario?.nombre} foto={p.de_usuario?.foto_url} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{p.de_usuario?.nombre}</p>
                      <p className="text-xs text-gray-400">{formatDate(p.fecha)}</p>
                    </div>
                    <span className="font-semibold text-green-600">{formatCurrency(p.monto)}</span>
                    <Button size="sm" variant="secondary" onClick={() => confirmar(p.id)}>Confirmar</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={`Registrar pago a ${destinatario?.nombre}`}>
        <form onSubmit={registrarPago} className="space-y-4">
          <Input label="Monto" type="number" min="0" step="0.01" value={form.monto} onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))} required />
          <Input label="Fecha" type="date" value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} required />
          <div>
            <label className="label">Grupo</label>
            <select className="input" value={form.grupo_id} onChange={(e) => setForm((f) => ({ ...f, grupo_id: e.target.value }))} required>
              <option value="">Selecciona un grupo</option>
              {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={guardando}>Registrar pago</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
