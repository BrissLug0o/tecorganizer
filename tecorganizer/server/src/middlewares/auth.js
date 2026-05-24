import jwt from 'jsonwebtoken'

export default function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }
  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123')
    req.userId = decoded.userId
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}