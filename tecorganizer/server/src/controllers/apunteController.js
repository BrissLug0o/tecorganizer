import prisma from '../prisma.js'
import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  },
})

export const upload = multer({ storage })

export const create = async (req, res) => {
  try {
    const { classId } = req.body
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null
    const apunte = await prisma.apunte.create({ data: { classId, imageUrl } })
    res.status(201).json(apunte)
  } catch (error) {
    res.status(500).json({ error: 'Error al subir el apunte' })
  }
}

export const getByClass = async (req, res) => {
  try {
    const apuntes = await prisma.apunte.findMany({
      where: { classId: req.params.classId },
      orderBy: { createdAt: 'desc' },
    })
    res.json(apuntes)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los apuntes' })
  }
}

export const remove = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.apunte.deleteMany({ where: { id } })
    res.json({ message: 'Apunte eliminado' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el apunte' })
  }
}