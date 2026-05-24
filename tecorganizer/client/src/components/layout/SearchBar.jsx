import { useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'
import useStore from '../../store/useStore'

const placeholders = {
  '/clases': 'Buscar clase o tarea...',
  '/calendario': 'Buscar evento...',
  '/racha': 'Buscar sesión de estudio...',
}

export default function SearchBar() {
  const location = useLocation()
  const searchQuery = useStore((s) => s.searchQuery)
  const setSearchQuery = useStore((s) => s.setSearchQuery)

  const placeholder =
    placeholders[location.pathname] || 'Buscar...'

  return (
    <div className="px-4 py-2 animate-slide-up">
      <div className="flex items-center gap-2 bg-[var(--color-bg-secondary)] rounded-xl px-3 py-2">
        <Search
          size={18}
          className="text-[var(--color-text-secondary)]"
        />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent outline-none text-sm w-full placeholder:text-[var(--color-text-secondary)] text-[var(--color-text-primary)]"
        />
      </div>
    </div>
  )
}