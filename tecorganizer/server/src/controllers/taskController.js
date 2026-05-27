import prisma from '../prisma.js'

export const create = async (req, res) => {
  try {
    const { classId, title, description, dueDate } = req.body
    const task = await prisma.task.create({
      data: {
        classId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })
    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la tarea' })
  }
}

export const getByClass = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { classId: req.params.classId },
    })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las tareas' })
  }
}

export const update = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, dueDate, completed, score } = req.body

    const data = {}
    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null
    if (completed !== undefined) data.completed = completed
    if (score !== undefined) data.score = score

    const task = await prisma.task.updateMany({
      where: { id },
      data,
    })
    if (task.count === 0) return res.status(404).json({ error: 'Tarea no encontrada' })
    res.json({ message: 'Tarea actualizada' })
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la tarea' })
  }
}

export const remove = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.task.deleteMany({ where: { id } })
    res.json({ message: 'Tarea eliminada' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la tarea' })
  }
}