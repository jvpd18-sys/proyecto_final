export default function Avatar({ nombre = '', foto, size = 'md', className = '' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base', xl: 'h-20 w-20 text-xl' }
  const initials = nombre.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  if (foto) return <img src={foto} alt={nombre} className={`${sizes[size]} rounded-full object-cover ${className}`} />
  return (
    <div className={`${sizes[size]} rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold flex-shrink-0 ${className}`}>
      {initials}
    </div>
  )
}
