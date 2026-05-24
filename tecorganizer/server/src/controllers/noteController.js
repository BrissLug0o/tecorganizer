import prisma from '../prisma.js'

export const create = async (req, res) => {
  try {
    const { classId, title, content } = req.body
    const note = await prisma.note.create({ data: { classId, title, content } })
    res.status(201).json(note)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la nota' })
  }
}

export const getByClass = async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { classId: req.params.classId },
      orderBy: { updatedAt: 'desc' },
    })
    res.json(notes)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las notas' })
  }
}

export const update = async (req, res) => {
  try {
    const { id } = req.params
    const { title, content } = req.body
    const note = await prisma.note.updateMany({
      where: { id },
      data: { title, content },
    })
    if (note.count === 0) return res.status(404).json({ error: 'Nota no encontrada' })
    res.json({ message: 'Nota actualizada' })
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la nota' })
  }
}

export const remove = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.note.deleteMany({ where: { id } })
    res.json({ message: 'Nota eliminada' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la nota' })
  }
}