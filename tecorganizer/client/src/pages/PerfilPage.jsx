import { useState, useEffect } from 'react'
import { User, BookOpen, Clock, Award } from 'lucide-react'
import useStore from '../store/useStore'
import EditProfileModal from '../components/EditProfileModal'
import { BASE_URL, UPLOADS_URL } from '../services/api'

function FlameIcon({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}

export default function PerfilPage() {
  const user = useStore((s) => s.user)
  const [stats, setStats] = useState({ totalClasses: 0, totalStudyHours: 0, averageGrade: null })
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${BASE_URL}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (err) {
        console.error('Error al cargar estadísticas:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="text-center animate-fade-in">
      <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-6 mb-6 animate-fade-in-scale">
        <div className="w-20 h-20 rounded-full bg-accent/20 mx-auto flex items-center justify-center mb-3 overflow-hidden">
          {user?.profilePic ? (
            <img src={`${UPLOADS_URL}${user.profilePic}`} alt="Perfil" className="w-full h-full object-cover" />
          ) : (
            <User size={36} className="text-accent" />
          )}
        </div>
        <h2 className="text-xl font-bold">{user?.name || 'Estudiante'}</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">{user?.email || ''}</p>
        <p className="text-sm text-[var(--color-text-secondary)]">{user?.career || 'Sin carrera'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0s' }}>
          <BookOpen size={24} className="text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.totalClasses}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Clases</p>
        </div>
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Clock size={24} className="text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.totalStudyHours}h</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Estudio</p>
        </div>
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Award size={24} className="text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.averageGrade ?? '--'}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Promedio</p>
        </div>
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <FlameIcon size={24} className="text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold">{user?.studyStreak || 0}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Racha</p>
        </div>
      </div>

      <button onClick={() => setEditModalOpen(true)} className="text-accent text-sm font-medium hover:underline">
        Editar perfil
      </button>

      <EditProfileModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} />
    </div>
  )
}