import prisma from '../prisma.js'

export const create = async (req, res) => {
  try {
    const { title, description, emoji, eventDate, eventTime, notify } = req.body
    const date = new Date(eventDate + 'T00:00:00')
    const event = await prisma.event.create({
      data: { userId: req.userId, title, description, emoji, eventDate: date, eventTime, notify },
    })
    res.status(201).json(event)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el evento' })
  }
}

export const getAll = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { userId: req.userId },
      orderBy: { eventDate: 'asc' },
    })
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los eventos' })
  }
}

export const update = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, emoji, eventDate, eventTime, notify } = req.body

    const data = {}
    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description
    if (emoji !== undefined) data.emoji = emoji
    if (eventDate !== undefined) data.eventDate = new Date(eventDate + 'T00:00:00')
    if (eventTime !== undefined) data.eventTime = eventTime
    if (notify !== undefined) data.notify = notify

    const event = await prisma.event.updateMany({
      where: { id, userId: req.userId },
      data,
    })
    if (event.count === 0) return res.status(404).json({ error: 'Evento no encontrado' })
    res.json({ message: 'Evento actualizado' })
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el evento' })
  }
}

export const remove = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.event.deleteMany({ where: { id, userId: req.userId } })
    res.json({ message: 'Evento eliminado' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el evento' })
  }
}