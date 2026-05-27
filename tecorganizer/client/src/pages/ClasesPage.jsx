import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { classes } from '../services/api'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import useStore from '../store/useStore'

export default function ClasesPage() {
  const [classList, setClassList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [formName, setFormName] = useState('')

  const searchQuery = useStore((s) => s.searchQuery)

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      setLoading(true)
      const data = await classes.getAll()
      setClassList(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingClass(null)
    setFormName('')
    setModalOpen(true)
  }

  const openEditModal = (cls) => {
    setEditingClass(cls)
    setFormName(cls.name)
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!formName.trim()) return
    try {
      if (editingClass) {
        await classes.update(editingClass.id, { name: formName })
      } else {
        await classes.create({ name: formName })
      }
      setModalOpen(false)
      loadClasses()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta clase y todo su contenido?')) return
    try {
      await classes.delete(id)
      loadClasses()
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  const filteredClasses = classList.filter((cls) =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="relative pb-20">
      {loading && (
        <p className="text-center text-[var(--color-text-secondary)] py-8 animate-fade-in">
          Cargando...
        </p>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-4 animate-fade-in">
          Error: {error}.{' '}
          <button onClick={loadClasses} className="underline">
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-3">
          {filteredClasses.map((cls, index) => (
            <div
              key={cls.id}
              className="relative group animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Link
                to={`/clases/${cls.id}`}
                className="flex items-center gap-4 bg-[var(--color-bg-secondary)] rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                  {cls.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{cls.name}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] truncate">
                    Clase
                  </p>
                </div>
                {cls.tasks?.filter((t) => !t.completed).length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cls.tasks.filter((t) => !t.completed).length}
                  </span>
                )}
                <ChevronRight
                  size={20}
                  className="text-[var(--color-text-secondary)]"
                />
              </Link>
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    openEditModal(cls)
                  }}
                  className="p-1 bg-white rounded-full shadow hover:text-accent"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleDelete(cls.id)
                  }}
                  className="p-1 bg-white rounded-full shadow hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {filteredClasses.length === 0 && (
            <p className="text-center text-[var(--color-text-secondary)] py-8 animate-fade-in">
              {searchQuery
                ? 'No se encontraron clases con ese nombre.'
                : 'No tienes clases aún. ¡Crea la primera!'}
            </p>
          )}
        </div>
      )}

      <button
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 hover:scale-110 transition-all duration-300 z-10"
      >
        <Plus size={28} />
      </button>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClass ? 'Editar clase' : 'Nueva clase'}
      >
        <input
          type="text"
          placeholder="Nombre de la clase"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className="w-full bg-[var(--color-bg-secondary)] rounded-xl px-4 py-2 mb-4 outline-none focus:ring-2 focus:ring-accent"
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {editingClass ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}