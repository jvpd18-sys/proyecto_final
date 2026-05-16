import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../api/client'
import KpiCard from '../components/ui/KpiCard'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { formatCurrency, formatDate } from '../utils/format'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/expenses/dashboard/summary/').then(({ data }) => setData(data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard titulo="Gasto mes actual" valor={formatCurrency(data.total_mes)} icono={DollarSign} />
        <KpiCard
          titulo="Balance neto"
          valor={formatCurrency(data.balance_neto)}
          icono={TrendingUp}
          color={data.balance_neto >= 0 ? 'text-green-600' : 'text-red-600'}
          bg={data.balance_neto >= 0 ? 'bg-green-50' : 'bg-red-50'}
        />
        <KpiCard titulo="Grupos activos" valor={data.grupos_activos} icono={Users} color="text-blue-600" bg="bg-blue-50" />
        <KpiCard titulo="Pagos pendientes" valor={formatCurrency(data.pagos_pendientes)} icono={AlertCircle} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Gastos por categoría (mes actual)</h2>
          {data.por_categoria.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Sin gastos registrados este mes</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.por_categoria} dataKey="total" nameKey="categoria" cx="50%" cy="50%" outerRadius={80} label={({ categoria }) => categoria}>
                  {data.por_categoria.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Gastos recientes</h2>
          {data.ultimos_gastos.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Sin gastos recientes</p>
          ) : (
            <div className="space-y-3">
              {data.ultimos_gastos.map((g) => (
                <div
                  key={g.id}
                  onClick={() => navigate(`/grupos/${g.grupo}`)}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{g.descripcion}</p>
                    <p className="text-xs text-gray-400">{formatDate(g.fecha)} · {g.pagado_por?.nombre}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {g.categoria && <Badge color={g.categoria.color_hex}>{g.categoria.nombre}</Badge>}
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(g.monto)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
