import supertest from 'supertest'
import app from '../src/index.js'
import prisma from '../src/prisma.js'

const request = supertest(app)
let token

beforeAll(async () => {
  // Limpiar usuario de prueba antes de registrarlo
  await prisma.user.deleteMany({ where: { email: 'test@test.com' } })
})

describe('Auth endpoints', () => {
  test('POST /api/auth/register', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@test.com', password: '123456' })
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('token')
    token = res.body.token
  })

  test('POST /api/auth/login', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: '123456' })
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  test('GET /api/auth/me', async () => {
    const res = await request
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('email', 'test@test.com')
  })

  test('Registro con contraseña corta', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'short@test.com', password: '123' })
    expect(res.statusCode).toBe(400)
  })
})