import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, User } from 'lucide-react'
import useStore from '../../store/useStore'

export default function Header() {
  const user = useStore((s) => s.user)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-[var(--color-border)]">
      <button
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
      >
        <Menu size={24} />
      </button>

      <h1 className="text-lg font-semibold">{user?.name || 'TecOrganizer'}</h1>

      <Link
        to="/perfil"
        className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
      >
{user?.profilePic ? (
  <img src={`${UPLOADS_URL}${user.profilePic}`} alt="Perfil" className="w-6 h-6 rounded-full object-cover" />
) : (
  <User size={24} />
)}
      </Link>

      {drawerOpen && (
        <div
          className="absolute top-14 left-0 w-64 bg-[var(--color-bg-secondary)] shadow-lg p-4 z-50 rounded-r-xl border-r border-b border-[var(--color-border)] animate-fade-in-scale"
          onClick={() => setDrawerOpen(false)}
        >
          <nav className="flex flex-col gap-3">
            <Link
              to="/perfil"
              className="px-3 py-2 rounded-lg hover:bg-[var(--color-bg-primary)] transition-colors"
              onClick={() => setDrawerOpen(false)}
            >
              Perfil
            </Link>
            <Link
              to="/ajustes"
              className="px-3 py-2 rounded-lg hover:bg-[var(--color-bg-primary)] transition-colors"
              onClick={() => setDrawerOpen(false)}
            >
              Ajustes
            </Link>
            <button
              className="text-left px-3 py-2 rounded-lg hover:bg-[var(--color-bg-primary)] transition-colors text-red-500"
              onClick={() => {
                useStore.getState().logout()
                setDrawerOpen(false)
              }}
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}