import supertest from 'supertest'
import app from '../src/index.js'
import prisma from '../src/prisma.js'

const request = supertest(app)
let token
let classId

beforeAll(async () => {
  // Limpiar usuario de prueba
  await prisma.user.deleteMany({ where: { email: 'class@test.com' } })

  const res = await request
    .post('/api/auth/register')
    .send({ name: 'Class Test', email: 'class@test.com', password: '123456' })
  token = res.body.token
})

describe('Classes endpoints', () => {
  test('POST /api/classes', async () => {
    const res = await request
      .post('/api/classes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Matemáticas' })
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('id')
    classId = res.body.id
  })

  test('GET /api/classes', async () => {
    const res = await request
      .get('/api/classes')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  test('DELETE /api/classes/:id', async () => {
    const res = await request
      .delete(`/api/classes/${classId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
  })
})