import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../auth/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'

const PASOS = ['Descripción', 'Detalles', 'Participantes']

export default function NuevoGasto() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [paso, setPaso] = useState(0)
  const [categorias, setCategorias] = useState([])
  const [grupos, setGrupos] = useState([])
  const [miembros, setMiembros] = useState([])
  const [categoriaSugerida, setCategoriaSugerida] = useState(null)
  const [cargandoIA, setCargandoIA] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    descripcion: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    grupo_id: location.state?.grupoId || '',
    categoria_id: '',
    pagado_por_id: user?.id || '',
    division: 'equitativa',
    participantes: [],
  })

  useEffect(() => {
    Promise.all([api.get('/expenses/categories/'), api.get('/groups/')]).then(([c, g]) => {
      setCategorias(c.data)
      setGrupos(g.data)
    })
  }, [])

  useEffect(() => {
    if (!form.grupo_id) { setMiembros([]); return }
    api.get(`/groups/${form.grupo_id}/members/`).then(({ data }) => {
      setMiembros(data)
      setForm((f) => ({ ...f, participantes: data.map((m) => ({ usuario_id: m.usuario.id, nombre: m.usuario.nombre, porcentaje: (100 / data.length).toFixed(2), checked: true })) }))
    })
  }, [form.grupo_id])

  const sugerirCategoria = async () => {
    if (!form.descripcion) return
    setCargandoIA(true)
    try {
      const { data } = await api.post('/ai/categorize/', { description: form.descripcion, amount: form.monto || 0 })
      setCategoriaSugerida(data)
      const existe = categorias.find((c) => c.id === data.category_id)
      if (existe) setForm((f) => ({ ...f, categoria_id: data.category_id }))
    } finally { setCargandoIA(false) }
  }

  const toggleParticipante = (uid) => {
    setForm((f) => {
      const updated = f.participantes.map((p) => p.usuario_id === uid ? { ...p, checked: !p.checked } : p)
      const activos = updated.filter((p) => p.checked)
      const pct = activos.length > 0 ? (100 / activos.length).toFixed(2) : '0.00'
      return { ...f, participantes: updated.map((p) => ({ ...p, porcentaje: p.checked ? pct : '0.00' })) }
    })
  }

  const cambiarPorcentaje = (uid, val) => {
    setForm((f) => ({ ...f, participantes: f.participantes.map((p) => p.usuario_id === uid ? { ...p, porcentaje: val } : p) }))
  }

  const guardar = async () => {
    setError('')
    setGuardando(true)
    try {
      const participantesActivos = form.participantes.filter((p) => p.checked).map((p) => ({ usuario_id: p.usuario_id, porcentaje: parseFloat(p.porcentaje) }))
      await api.post('/expenses/', {
        grupo: parseInt(form.grupo_id),
        descripcion: form.descripcion,
        monto: parseFloat(form.monto),
        fecha: form.fecha,
        categoria_id: form.categoria_id || null,
        pagado_por_id: parseInt(form.pagado_por_id),
        participantes: participantesActivos,
      })
      navigate(`/grupos/${form.grupo_id}`)
    } catch (err) {
      const d = err.response?.data?.detail || err.response?.data
      setError(typeof d === 'string' ? d : JSON.stringify(d))
    } finally { setGuardando(false) }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        {PASOS.map((p, i) => (
          <div key={p} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= paso ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</div>
            <span className={`text-sm ${i === paso ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>{p}</span>
            {i < PASOS.length - 1 && <div className={`h-px w-8 ${i < paso ? 'bg-primary-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <Card>
        {paso === 0 && (
          <div className="space-y-4">
            <Input label="Descripción del gasto" placeholder="Ej: Pizza para la reunión" value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} required />
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" loading={cargandoIA} onClick={sugerirCategoria} disabled={!form.descripcion}>
                <Sparkles className="h-4 w-4 text-primary-500" />Sugerir categoría con IA
              </Button>
              {categoriaSugerida && <Badge color="#6366f1">{categoriaSugerida.category_name}</Badge>}
            </div>
            <Button className="w-full justify-center" onClick={() => setPaso(1)} disabled={!form.descripcion}>Siguiente</Button>
          </div>
        )}

        {paso === 1 && (
          <div className="space-y-4">
            <Input label="Monto" type="number" min="0" step="0.01" placeholder="0.00" value={form.monto} onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))} required />
            <Input label="Fecha" type="date" value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} required />
            <div>
              <label className="label">Grupo</label>
              <select className="input" value={form.grupo_id} onChange={(e) => setForm((f) => ({ ...f, grupo_id: e.target.value }))} required>
                <option value="">Selecciona un grupo</option>
                {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Categoría</label>
              <select className="input" value={form.categoria_id} onChange={(e) => setForm((f) => ({ ...f, categoria_id: e.target.value }))}>
                <option value="">Sin categoría</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label">¿Quién pagó?</label>
              <select className="input" value={form.pagado_por_id} onChange={(e) => setForm((f) => ({ ...f, pagado_por_id: e.target.value }))}>
                {miembros.map((m) => <option key={m.usuario.id} value={m.usuario.id}>{m.usuario.nombre}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="flex-1 justify-center" onClick={() => setPaso(0)}>Atrás</Button>
              <Button className="flex-1 justify-center" onClick={() => setPaso(2)} disabled={!form.monto || !form.grupo_id}>Siguiente</Button>
            </div>
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <label className="label mb-0">División</label>
              <button onClick={() => setForm((f) => ({ ...f, division: 'equitativa' }))} className={`text-xs px-3 py-1 rounded-full border ${form.division === 'equitativa' ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-600'}`}>Equitativa</button>
              <button onClick={() => setForm((f) => ({ ...f, division: 'manual' }))} className={`text-xs px-3 py-1 rounded-full border ${form.division === 'manual' ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-600'}`}>Manual</button>
            </div>

            <div className="space-y-2">
              {form.participantes.map((p) => (
                <div key={p.usuario_id} className="flex items-center gap-3">
                  <input type="checkbox" checked={p.checked} onChange={() => toggleParticipante(p.usuario_id)} className="h-4 w-4 rounded text-primary-600" />
                  <span className="flex-1 text-sm text-gray-700">{p.nombre}</span>
                  {form.division === 'manual' && p.checked ? (
                    <input type="number" min="0" max="100" step="0.01" className="input w-24 text-right" value={p.porcentaje} onChange={(e) => cambiarPorcentaje(p.usuario_id, e.target.value)} />
                  ) : (
                    <span className="text-sm text-gray-500 w-16 text-right">{p.checked ? `${p.porcentaje}%` : '0%'}</span>
                  )}
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="flex-1 justify-center" onClick={() => setPaso(1)}>Atrás</Button>
              <Button className="flex-1 justify-center" loading={guardando} onClick={guardar}>Registrar gasto</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
