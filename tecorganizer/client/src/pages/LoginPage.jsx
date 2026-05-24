import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useStore((s) => s.login)
  const isAuthLoading = useStore((s) => s.isAuthLoading)
  const authError = useStore((s) => s.authError)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/clases')
    } catch (err) {}
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] p-4">
      <form onSubmit={handleSubmit} className="bg-[var(--color-bg-secondary)] rounded-2xl p-8 w-full max-w-md shadow-sm animate-fade-in-scale">
        <h1 className="text-2xl font-bold mb-6 text-center text-[var(--color-text-primary)]">TecOrganizer</h1>

        {authError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-sm animate-fade-in">{authError}</div>
        )}

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-accent transition-all duration-200 animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] rounded-xl px-4 py-3 mb-6 outline-none focus:ring-2 focus:ring-accent transition-all duration-200 animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        />

        <Button type="submit" className="w-full animate-fade-in" style={{ animationDelay: '0.3s' }} disabled={isAuthLoading}>
          {isAuthLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>

        <p className="text-sm text-center mt-4 text-[var(--color-text-secondary)] animate-fade-in">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-accent font-medium hover:underline">Registrarse</Link>
        </p>
      </form>
    </div>
  )
}