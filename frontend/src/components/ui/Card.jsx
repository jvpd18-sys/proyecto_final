export default function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`card p-5 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
