import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import classRoutes from './routes/classes.js'
import taskRoutes from './routes/tasks.js'
import noteRoutes from './routes/notes.js'
import apunteRoutes from './routes/apuntes.js'
import gradeRoutes from './routes/grades.js'
import studyRoutes from './routes/study.js'
import eventRoutes from './routes/events.js'
import statsRoutes from './routes/stats.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Servir archivos estáticos (imágenes, apuntes, etc.)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Middlewares de seguridad
app.use(helmet())
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
)

// Rutas de la API
app.use('/api/auth', authRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/apuntes', apunteRoutes)
app.use('/api/grades', gradeRoutes)
app.use('/api/study', studyRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/stats', statsRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'API TecOrganizer funcionando' })
})

 if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
  })
}

export default app