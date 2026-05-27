import supertest from 'supertest'
import app from '../src/index.js'
import prisma from '../src/prisma.js'

const request = supertest(app)
let token

beforeAll(async () => {

  await prisma.user.deleteMany({ where: { email: 'event@test.com' } })

  const res = await request
    .post('/api/auth/register')
    .send({ name: 'Event Test', email: 'event@test.com', password: '123456' })
  token = res.body.token
})

describe('Events endpoints', () => {
  let eventId

  test('POST /api/events', async () => {
    const res = await request
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Evento prueba', eventDate: '2026-12-25', emoji: '🎉' })
    expect(res.statusCode).toBe(201)
    eventId = res.body.id
  })

  test('GET /api/events', async () => {
    const res = await request
      .get('/api/events')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)
  })

  test('PUT /api/events/:id', async () => {
    const res = await request
      .put(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Evento actualizado' })
    expect(res.statusCode).toBe(200)
  })

  test('DELETE /api/events/:id', async () => {
    const res = await request
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(200)
  })
})