import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Tabs from './Tabs'
import SearchBar from './SearchBar'

export default function Layout() {
  const location = useLocation()

  const hideSearch =
    location.pathname.startsWith('/perfil') ||
    location.pathname.startsWith('/ajustes') ||
    location.pathname.startsWith('/clases/') || // Detalle de clase
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register')

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Header />
      <Tabs />
      {!hideSearch && <SearchBar />}
      <main className="flex-1 overflow-auto px-4 py-4 animate-fade-in">
        <Outlet />
      </main>
    </div>
  )
}