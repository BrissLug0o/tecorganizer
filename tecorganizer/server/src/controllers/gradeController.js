import prisma from '../prisma.js'

export const create = async (req, res) => {
  try {
    const { classId, name, score, weight, examDate } = req.body

    // Validar ponderación (0-1)
    if (weight !== undefined && (isNaN(weight) || weight < 0 || weight > 1)) {
      return res.status(400).json({ error: 'La ponderación debe estar entre 0 y 1' })
    }

    // Validar y construir la fecha correctamente
    let date = null
    if (examDate) {
      date = new Date(examDate + 'T00:00:00')
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Fecha de examen inválida' })
      }
    }

    const data = {
      name,
      weight: weight || null,
      examDate: date,
      class: {
        connect: { id: classId },
      },
    }
    // Solo incluir score si se proporciona
    if (score !== undefined && score !== null) {
      data.score = score
    } else {
      data.score = 0
    }

    const grade = await prisma.grade.create({ data })
    res.status(201).json(grade)
  } catch (error) {
    console.error('Error al crear calificación:', error)
    res.status(500).json({ error: 'Error al crear la calificación' })
  }
}

export const getByClass = async (req, res) => {
  try {
    const grades = await prisma.grade.findMany({
      where: { classId: req.params.classId },
    })
    res.json(grades)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las calificaciones' })
  }
}

export const update = async (req, res) => {
  try {
    const { id } = req.params
    const { name, score, weight, examDate } = req.body

    const data = {}
    if (name !== undefined) data.name = name
    if (score !== undefined) data.score = score
    if (weight !== undefined) data.weight = weight

    if (examDate !== undefined) {
      const date = examDate ? new Date(examDate + 'T00:00:00') : null
      if (examDate && isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Fecha de examen inválida' })
      }
      data.examDate = date
    }

    const grade = await prisma.grade.updateMany({ where: { id }, data })
    if (grade.count === 0) return res.status(404).json({ error: 'Calificación no encontrada' })
    res.json({ message: 'Calificación actualizada' })
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la calificación' })
  }
}

export const remove = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.grade.deleteMany({ where: { id } })
    res.json({ message: 'Calificación eliminada' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la calificación' })
  }
}