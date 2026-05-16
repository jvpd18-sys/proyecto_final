import { useEffect, useState } from 'react'
import { Sparkles, RefreshCw, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import api from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { formatCurrency } from '../utils/format'

export default function RecomendacionesIA() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actualizando, setActualizando] = useState(false)

  const cargar = async (forzar = false) => {
    if (forzar) setActualizando(true)
    else setLoading(true)
    try {
      const { data: d } = await api.get('/ai/recommendations/')
      setData(d)
    } finally { setLoading(false); setActualizando(false) }
  }

  useEffect(() => { cargar() }, [])

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Cargando recomendaciones...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-500" />
          <h2 className="font-semibold text-gray-900">Recomendaciones personalizadas</h2>
        </div>
        <Button variant="secondary" size="sm" loading={actualizando} onClick={() => cargar(true)}>
          <RefreshCw className="h-4 w-4" />Actualizar
        </Button>
      </div>

      {!data || data.recomendaciones?.length === 0 ? (
        <EmptyState icono={TrendingDown} mensaje={data?.mensaje || 'Registra más gastos para obtener recomendaciones personalizadas.'} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.recomendaciones.map((r, i) => (
              <Card key={i}>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-bold text-sm">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{r}</p>
                </div>
              </Card>
            ))}
          </div>

          {data.resumen && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Distribución de gastos este mes</h3>
              {(() => {
                const chartData = data.resumen.split(', ').map((item) => {
                  const [nombre, monto] = item.split(': $')
                  return { nombre: nombre.trim(), monto: parseFloat(monto) || 0 }
                })
                return (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                      <Bar dataKey="monto" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )
              })()}
            </Card>
          )}
        </>
      )}
    </div>
  )
}
