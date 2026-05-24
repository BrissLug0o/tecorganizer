import { useState } from 'react'
import useStore from '../store/useStore'
import { auth, UPLOADS_URL } from '../services/api'
import Modal from './ui/Modal'
import Button from './ui/Button'

export default function EditProfileModal({ isOpen, onClose }) {
  const user = useStore((s) => s.user)
  const setUser = useStore((s) => s.setUser)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [career, setCareer] = useState(user?.career || '')
  const [password, setPassword] = useState('')
  const [profilePic, setProfilePic] = useState(user?.profilePic || '')
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSelectedFile(file)
    setLoading(true)
    try {
      const data = await auth.uploadProfilePic(file)
      setProfilePic(data.url)
    } catch (err) {
      alert('Error al subir la foto: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { name, email, career, profilePic }
      if (password) payload.password = password
      const updatedUser = await auth.update(payload)
      setUser(updatedUser)
      onClose()
    } catch (err) {
      alert('Error al actualizar perfil: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar perfil">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden">
            {profilePic ? (
              <img
                src={`${UPLOADS_URL}${profilePic}`}
                alt="Perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">👤</span>
            )}
            <label className="absolute bottom-0 right-0 bg-accent text-white rounded-full p-1 cursor-pointer shadow hover:opacity-90 transition-opacity">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <span className="text-sm text-[var(--color-text-secondary)]">
            Haz clic para cambiar foto
          </span>
        </div>

        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[var(--color-bg-secondary)] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[var(--color-bg-secondary)] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="text"
          placeholder="Carrera"
          value={career}
          onChange={(e) => setCareer(e.target.value)}
          className="w-full bg-[var(--color-bg-secondary)] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="password"
          placeholder="Nueva contraseña (opcional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-[var(--color-bg-secondary)] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}