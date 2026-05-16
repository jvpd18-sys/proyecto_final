import { useCallback, useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import api from '../api/client'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { formatCurrency, formatDateShort } from '../utils/format'

export default function Historial() {
  const [gastos, setGastos] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [grupos, setGrupos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [filtros, setFiltros] = useState({ group: '', category: '', from: '', to: '', q: '' })

  const cargar = useCallback((p = page) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p, ...Object.fromEntries(Object.entries(filtros).filter(([, v]) => v)) })
    api.get(`/expenses/?${params}`).then(({ data }) => {
      setGastos(data.results || data)
      setTotal(data.total || 0)
      setPage(p)
    }).finally(() => setLoading(false))
  }, [filtros, page])

  useEffect(() => {
    cargar(1)
    Promise.all([api.get('/groups/'), api.get('/expenses/categories/')]).then(([g, c]) => {
      setGrupos(g.data)
      setCategorias(c.data)
    })
  }, [])

  const setFiltro = (k) => (e) => {
    const nuevo = { ...filtros, [k]: e.target.value }
    setFiltros(nuevo)
    const params = new URLSearchParams({ page: 1, ...Object.fromEntries(Object.entries(nuevo).filter(([, v]) => v)) })
    setLoading(true)
    api.get(`/expenses/?${params}`).then(({ data }) => {
      setGastos(data.results || data)
      setTotal(data.total || 0)
      setPage(1)
    }).finally(() => setLoading(false))
  }

  const exportCSV = () => {
    const header = 'Fecha,Descripción,Categoría,Monto,Pagó,Grupo'
    const rows = gastos.map((g) => `${g.fecha},"${g.descripcion}",${g.categoria?.nombre || ''},${g.monto},${g.pagado_por?.nombre},${g.grupo}`)
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'historial_gastos.csv'; a.click()
  }

  const totalPags = Math.ceil(total / 10)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <select className="input" value={filtros.group} onChange={setFiltro('group')}>
          <option value="">Todos los grupos</option>
          {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
        </select>
        <select className="input" value={filtros.category} onChange={setFiltro('category')}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <input type="date" className="input" value={filtros.from} onChange={setFiltro('from')} placeholder="Desde" />
        <input type="date" className="input" value={filtros.to} onChange={setFiltro('to')} placeholder="Hasta" />
        <input type="text" className="input" placeholder="Buscar..." value={filtros.q} onChange={setFiltro('q')} />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{total} resultado{total !== 1 ? 's' : ''}</p>
        <Button variant="secondary" size="sm" onClick={exportCSV}><Download className="h-4 w-4" />Exportar CSV</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-gray-400">Cargando...</div>
      ) : gastos.length === 0 ? (
        <EmptyState mensaje="No se encontraron gastos con los filtros aplicados." />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                  <th className="pb-2 pr-4 font-medium">Fecha</th>
                  <th className="pb-2 pr-4 font-medium">Descripción</th>
                  <th className="pb-2 pr-4 font-medium">Categoría</th>
                  <th className="pb-2 pr-4 font-medium text-right">Monto</th>
                  <th className="pb-2 pr-4 font-medium">Pagó</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((g) => (
                  <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{formatDateShort(g.fecha)}</td>
                    <td className="py-3 pr-4 font-medium text-gray-900">{g.descripcion}</td>
                    <td className="py-3 pr-4">{g.categoria ? <Badge color={g.categoria.color_hex}>{g.categoria.nombre}</Badge> : <span className="text-gray-400">—</span>}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(g.monto)}</td>
                    <td className="py-3 pr-4 text-gray-600">{g.pagado_por?.nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPags > 1 && (
            <div className="flex justify-center gap-1">
              {Array.from({ length: totalPags }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => cargar(p)} className={`h-8 w-8 rounded-lg text-sm font-medium ${p === page ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{p}</button>

              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
