import prisma from '../prisma.js'
import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp/uploads') 
  },
  filename: (req, file, cb) => {
    const unique = 'evidence-' + Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  },
})

export const upload = multer({ storage })

export const start = async (req, res) => {
  res.json({ message: 'Sesión iniciada', timestamp: new Date() })
}

export const complete = async (req, res) => {
  try {
    const { method, duration, evidenceUrl } = req.body
    const session = await prisma.studySession.create({
      data: {
        userId: req.userId,
        method,
        duration,
        evidenceUrl,
      },
    })

    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    const today = new Date()
    const last = user.lastStudyDate ? new Date(user.lastStudyDate) : null
    let newStreak = user.studyStreak
    if (!last || last.toDateString() !== today.toDateString()) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      if (last && last.toDateString() === yesterday.toDateString()) {
        newStreak += 1
      } else {
        newStreak = 1
      }
    }
    const maxStreak = Math.max(user.maxStreak, newStreak)
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { studyStreak: newStreak, maxStreak, lastStudyDate: today },
    })
    res.status(201).json({ session, user: updatedUser })
  } catch (error) {
    res.status(500).json({ error: 'Error al completar la sesión' })
  }
}

export const history = async (req, res) => {
  try {
    const sessions = await prisma.studySession.findMany({
      where: { userId: req.userId },
      orderBy: { completedAt: 'desc' },
    })
    res.json(sessions)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial' })
  }
}

export const getByMethod = async (req, res) => {
  try {
    const { method } = req.params
    const sessions = await prisma.studySession.findMany({
      where: { userId: req.userId, method },
      orderBy: { completedAt: 'desc' },
      select: { id: true, evidenceUrl: true, questions: true, completedAt: true, method: true },
    })
    res.json(sessions)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener evidencias' })
  }
}

export const uploadEvidence = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' })
    }
    // La ruta será /uploads/evidence-xxx.jpg, pero los archivos estarán en /tmp/uploads
    const url = `/uploads/${req.file.filename}`
    res.json({ url })
  } catch (error) {
    res.status(500).json({ error: 'Error al subir la evidencia' })
  }
}