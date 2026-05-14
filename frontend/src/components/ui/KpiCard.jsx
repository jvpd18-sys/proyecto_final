import Card from './Card'

export default function KpiCard({ titulo, valor, icono: Icono, color = 'text-primary-600', bg = 'bg-primary-50', subtitulo }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{titulo}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{valor}</p>
          {subtitulo && <p className="mt-0.5 text-xs text-gray-400">{subtitulo}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${bg}`}>
          {Icono && <Icono className={`h-5 w-5 ${color}`} />}
        </div>
      </div>
    </Card>
  )
}
