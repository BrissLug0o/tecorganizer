import supertest from 'supertest'
import app from '../src/index.js'
import prisma from '../src/prisma.js'

const request = supertest(app)
let token

beforeAll(async () => {

  await prisma.user.deleteMany({ where: { email: 'study@test.com' } })

  const res = await request
    .post('/api/auth/register')
    .send({ name: 'Study Test', email: 'study@test.com', password: '123456' })
  token = res.body.token
})

describe('Study endpoints', () => {
  test('POST /api/study/complete', async () => {
    const res = await request
      .post('/api/study/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ method: 'pomodoro', duration: 25 })
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('session')
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('studyStreak', 1)
  })

  test('GET /api/study/history', async () => {
    const res = await request
      .get('/api/study/history')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})