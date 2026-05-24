import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useStore from './store/useStore'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ClasesPage from './pages/ClasesPage'
import DetalleClasePage from './pages/DetalleClasePage'
import CalendarioPage from './pages/CalendarioPage'
import RachaPage from './pages/RachaPage'
import PerfilPage from './pages/PerfilPage'
import AjustesPage from './pages/AjustesPage'

function ProtectedRoute({ children }) {
  const token = useStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const fetchUser = useStore((s) => s.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/clases" replace />} />
          <Route path="clases" element={<ClasesPage />} />
          <Route path="clases/:id" element={<DetalleClasePage />} />
          <Route path="calendario" element={<CalendarioPage />} />
          <Route path="racha" element={<RachaPage />} />
          <Route path="perfil" element={<PerfilPage />} />
          <Route path="ajustes" element={<AjustesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}