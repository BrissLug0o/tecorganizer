import { NavLink } from 'react-router-dom'
import { BookOpen, Calendar, Flame } from 'lucide-react'

const tabs = [
  { to: '/clases', icon: BookOpen, label: 'Clases' },
  { to: '/calendario', icon: Calendar, label: 'Calendario' },
  { to: '/racha', icon: Flame, label: 'Racha' },
]

export default function Tabs() {
  return (
    <nav className="flex justify-around border-b border-[var(--color-border)]">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-1.5 py-3 px-4 text-sm font-medium transition-all duration-200 border-b-2 
            ${isActive ? 'border-accent text-accent opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-80'}`
          }
        >
          <Icon size={18} className="transition-transform duration-200 group-hover:scale-110" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}