import prisma from '../prisma.js'
import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const unique = 'syllabus-' + Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'), false)
  }
}

export const uploadSyllabus = multer({ storage, fileFilter })

// CRUD básico de clases
export const create = async (req, res) => {
  try {
    const { name, image, syllabusUrl } = req.body
    const newClass = await prisma.class.create({
      data: { userId: req.userId, name, image, syllabusUrl },
    })
    res.status(201).json(newClass)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la clase' })
  }
}

export const getAll = async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      where: { userId: req.userId },
      include: { tasks: true },
    })
    res.json(classes)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las clases' })
  }
}

export const getById = async (req, res) => {
  try {
    const { id } = req.params
    const classItem = await prisma.class.findFirst({
      where: { id, userId: req.userId },
      include: { tasks: true, notes: true, apuntes: true, grades: true },
    })
    if (!classItem) return res.status(404).json({ error: 'Clase no encontrada' })
    res.json(classItem)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la clase' })
  }
}

export const update = async (req, res) => {
  try {
    const { id } = req.params
    const { name, image, syllabusUrl } = req.body
    await prisma.class.updateMany({
      where: { id, userId: req.userId },
      data: { name, image, syllabusUrl },
    })
    res.json({ message: 'Clase actualizada' })
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la clase' })
  }
}

export const remove = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.class.deleteMany({ where: { id, userId: req.userId } })
    res.json({ message: 'Clase eliminada' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la clase' })
  }
}

export const updateSyllabus = async (req, res) => {
  try {
    const { id } = req.params
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' })
    }
    const url = `/uploads/${req.file.filename}`
    await prisma.class.updateMany({
      where: { id, userId: req.userId },
      data: { syllabusUrl: url },
    })
    res.json({ url })
  } catch (error) {
    res.status(500).json({ error: 'Error al subir el temario' })
  }
}

export const removeSyllabus = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.class.updateMany({
      where: { id, userId: req.userId },
      data: { syllabusUrl: null },
    })
    res.json({ message: 'Temario eliminado' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el temario' })
  }
}