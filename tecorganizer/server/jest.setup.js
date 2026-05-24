import prisma from './src/prisma.js'

beforeAll(async () => {
  // Limpiar tablas en orden (por las relaciones)
  await prisma.event.deleteMany()
  await prisma.studySession.deleteMany()
  await prisma.grade.deleteMany()
  await prisma.apunte.deleteMany()
  await prisma.note.deleteMany()
  await prisma.task.deleteMany()
  await prisma.class.deleteMany()
  await prisma.user.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})