import supertest from 'supertest'
import app from '../src/index.js'
import prisma from '../src/prisma.js'

const request = supertest(app)
let token
let classId
let taskId

beforeAll(async () => {
  // Limpiar usuario de prueba
  await prisma.user.deleteMany({ where: { email: 'task@test.com' } })

  const res = await request
    .post('/api/auth/register')
    .send({ name: 'Task Test', email: 'task@test.com', password: '123456' })
  token = res.body.token

  const classRes = await request
    .post('/api/classes')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Física' })
  classId = classRes.body.id
})

describe('Tasks endpoints', () => {
  test('POST /api/tasks', async () => {
    const res = await request
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ classId, title: 'Tarea 1', dueDate: '2026-12-31' })
    expect(res.statusCode).toBe(201)
    taskId = res.body.id
  })

  test('GET /api/tasks/class/:classId', async () => {
    const res = await request
      .get(`/api/tasks/class/${classId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)
  })

  test('PUT /api/tasks/:id (completar)', async () => {
    const res = await request
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ completed: true })
    expect(res.statusCode).toBe(200)
  })
})