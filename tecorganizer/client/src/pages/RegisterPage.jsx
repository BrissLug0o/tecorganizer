import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import Button from '../components/ui/Button'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [career, setCareer] = useState('')
  const register = useStore((s) => s.register)
  const isAuthLoading = useStore((s) => s.isAuthLoading)
  const authError = useStore((s) => s.authError)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(name, email, password, career)
      navigate('/clases')
    } catch (err) {}
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] p-4">
      <form onSubmit={handleSubmit} className="bg-[var(--color-bg-secondary)] rounded-2xl p-8 w-full max-w-md shadow-sm animate-fade-in-scale">
        <h1 className="text-2xl font-bold mb-6 text-center text-[var(--color-text-primary)]">Crear cuenta</h1>

        {authError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-sm animate-fade-in">{authError}</div>
        )}

        <input
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-accent transition-all duration-200 animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-accent transition-all duration-200 animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-accent transition-all duration-200 animate-fade-in"
          style={{ animationDelay: '0.3s' }}
        />
        <p className="text-xs text-[var(--color-text-secondary)] -mt-2 mb-3">Mínimo 6 caracteres</p>
        <input
          type="text"
          placeholder="Carrera (opcional)"
          value={career}
          onChange={(e) => setCareer(e.target.value)}
          className="w-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] rounded-xl px-4 py-3 mb-6 outline-none focus:ring-2 focus:ring-accent transition-all duration-200 animate-fade-in"
          style={{ animationDelay: '0.4s' }}
        />

        <Button type="submit" className="w-full animate-fade-in" style={{ animationDelay: '0.5s' }} disabled={isAuthLoading}>
          {isAuthLoading ? 'Registrando...' : 'Registrarse'}
        </Button>

        <p className="text-sm text-center mt-4 text-[var(--color-text-secondary)] animate-fade-in">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-accent font-medium hover:underline">Iniciar sesión</Link>
        </p>
      </form>
    </div>
  )
}