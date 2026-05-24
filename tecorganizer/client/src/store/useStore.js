import { create } from 'zustand'
import { auth } from '../services/api'

const useStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthLoading: false,
  authError: null,

  // Acciones de autenticación
  login: async (email, password) => {
    set({ isAuthLoading: true, authError: null })
    try {
      const data = await auth.login({ email, password })
      localStorage.setItem('token', data.token)

      if (data.user.accentColor) {
        document.documentElement.style.setProperty('--accent', data.user.accentColor)
        localStorage.setItem('accentColor', data.user.accentColor)
      } else {
        document.documentElement.style.setProperty('--accent', '#4A90E2')
        localStorage.setItem('accentColor', '#4A90E2')
      }

      const userTheme = data.user.theme || 'light'
      localStorage.setItem('theme', userTheme)
      if (userTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

      set({
        user: {
          ...data.user,
          studyStreak: data.user.studyStreak ?? 0,
          maxStreak: data.user.maxStreak ?? 0,
        },
        token: data.token,
        isAuthLoading: false,
      })
      return data
    } catch (error) {
      set({ authError: error.message, isAuthLoading: false })
      throw error
    }
  },

  register: async (name, email, password, career) => {
    set({ isAuthLoading: true, authError: null })
    try {
      const data = await auth.register({ name, email, password, career })
      localStorage.setItem('token', data.token)
      document.documentElement.classList.remove('dark')
      document.documentElement.style.setProperty('--accent', '#4A90E2')
      localStorage.setItem('theme', 'light')
      localStorage.setItem('accentColor', '#4A90E2')
      set({ user: data.user, token: data.token, isAuthLoading: false })
      return data
    } catch (error) {
      set({ authError: error.message, isAuthLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    document.documentElement.classList.remove('dark')
    document.documentElement.style.setProperty('--accent', '#4A90E2')
    localStorage.setItem('theme', 'light')
    localStorage.setItem('accentColor', '#4A90E2')
    set({
      user: null,
      token: null,
      theme: 'light',
      accentColor: '#4A90E2',
    })
  },

  fetchUser: async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const userData = await auth.me()
      if (userData.accentColor) {
        document.documentElement.style.setProperty('--accent', userData.accentColor)
        localStorage.setItem('accentColor', userData.accentColor)
      } else {
        document.documentElement.style.setProperty('--accent', '#4A90E2')
        localStorage.setItem('accentColor', '#4A90E2')
      }
      const userTheme = userData.theme || 'light'
      localStorage.setItem('theme', userTheme)
      if (userTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      set({
        user: {
          ...userData,
          studyStreak: userData.studyStreak ?? 0,
          maxStreak: userData.maxStreak ?? 0,
        },
        theme: userTheme,
        accentColor: userData.accentColor || '#4A90E2',
      })
    } catch (error) {
      console.error('Error al obtener usuario:', error)
    }
  },

  // Actualizar SOLO la racha (se llama desde RachaPage tras completar sesión)
  updateUserRacha: (studyStreak, maxStreak) => {
    set((state) => ({
      user: state.user ? { ...state.user, studyStreak, maxStreak } : null,
    }))
  },

  setUser: (user) => set({ user }),

  theme: localStorage.getItem('theme') || 'light',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ theme })
  },

  accentColor: localStorage.getItem('accentColor') || '#4A90E2',
  setAccentColor: (color) => {
    localStorage.setItem('accentColor', color)
    document.documentElement.style.setProperty('--accent', color)
    set({ accentColor: color })
  },

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}))

export default useStore