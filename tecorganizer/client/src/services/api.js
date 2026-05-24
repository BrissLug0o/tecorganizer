export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
export const UPLOADS_URL = BASE_URL.replace(/\/api$/, '') // para imágenes, sin /api

const getToken = () => localStorage.getItem('token')

async function request(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Error en la petición')
  return data
}

// Autenticación
export const auth = {
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  me: () => request('/auth/me'),
  update: (data) => request('/auth/update', { method: 'PUT', body: JSON.stringify(data) }),
  uploadProfilePic: (file) => {
    const formData = new FormData()
    formData.append('profilePic', file)
    return request('/auth/upload-profile-pic', { method: 'POST', body: formData })
  },
}

// Clases
export const classes = {
  getAll: () => request('/classes'),
  getById: (id) => request(`/classes/${id}`),
  create: (data) => request('/classes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/classes/${id}`, { method: 'DELETE' }),
  uploadSyllabus: (id, file) => {
    const formData = new FormData()
    formData.append('syllabus', file)
    return request(`/classes/${id}/syllabus`, { method: 'PUT', body: formData })
  },
  deleteSyllabus: (id) => request(`/classes/${id}/syllabus`, { method: 'DELETE' }),
}

// Tareas
export const tasks = {
  getByClass: (classId) => request(`/tasks/class/${classId}`),
  create: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
}

// Notas
export const notes = {
  getByClass: (classId) => request(`/notes/class/${classId}`),
  create: (data) => request('/notes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/notes/${id}`, { method: 'DELETE' }),
}

// Apuntes (solo imágenes)
export const apuntes = {
  getByClass: (classId) => request(`/apuntes/class/${classId}`),
  upload: (classId, file) => {
    const formData = new FormData()
    formData.append('classId', classId)
    formData.append('image', file)
    return request('/apuntes', { method: 'POST', body: formData })
  },
  delete: (id) => request(`/apuntes/${id}`, { method: 'DELETE' }),
}

// Calificaciones
export const grades = {
  getByClass: (classId) => request(`/grades/class/${classId}`),
  create: (data) => request('/grades', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/grades/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/grades/${id}`, { method: 'DELETE' }),
}

// Estudio
export const study = {
  complete: (data) => request('/study/complete', { method: 'POST', body: JSON.stringify(data) }),
  history: () => request('/study/history'),
  getByMethod: (method) => request(`/study/history/${method}`),
}

// Eventos
export const events = {
  getAll: () => request('/events'),
  create: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/events/${id}`, { method: 'DELETE' }),
}

// Estadísticas
export const stats = {
  get: () => request('/stats'),
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
export const UPLOADS_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:3000'