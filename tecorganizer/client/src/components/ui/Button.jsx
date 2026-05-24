export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent'
  const variants = {
    primary: 'bg-accent text-white hover:opacity-90 shadow-sm',
    secondary: 'border border-accent text-accent hover:bg-accent hover:text-white',
    ghost: 'text-accent hover:bg-accent/10',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}