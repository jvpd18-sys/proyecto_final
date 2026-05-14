import { Inbox } from 'lucide-react'

export default function EmptyState({ mensaje = 'No hay datos disponibles', icono: Icono = Inbox, accion }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icono className="h-12 w-12 text-gray-300 mb-3" />
      <p className="text-gray-500 text-sm">{mensaje}</p>
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}
