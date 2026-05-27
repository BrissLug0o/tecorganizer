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
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

fs.mkdirSync('/tmp/uploads', { recursive: true })

app.use('/uploads', express.static('/tmp/uploads'))
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'img-src': ["'self'", 'data:', 'blob:', 'https://tecorganizer-api.onrender.com'],
        'connect-src': ["'self'", 'https://tecorganizer-api.onrender.com'],
      },
    },
  })
)
app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
)

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