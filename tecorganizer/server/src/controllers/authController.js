import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prisma.js'
import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = 'profile-' + Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  },
})

export const upload = multer({ storage })

export const register = async (req, res) => {
  try {
    const { name, email, password, career } = req.body

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(400).json({ error: 'El correo ya está registrado' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, career },
    })
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' })
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar' })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ error: 'Credenciales inválidas' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json({ error: 'Credenciales inválidas' })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' })
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        career: user.career,
        profilePic: user.profilePic,
        theme: user.theme,
        accentColor: user.accentColor,
        studyStreak: user.studyStreak,
        maxStreak: user.maxStreak,
      },
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
}

export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true, name: true, email: true, career: true, profilePic: true,
        theme: true, accentColor: true, studyStreak: true, maxStreak: true,
      },
    })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' })
  }
}

export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se proporcionó archivo' })
    res.json({ url: `/uploads/${req.file.filename}` })
  } catch (error) {
    res.status(500).json({ error: 'Error al subir la foto' })
  }
}

export const update = async (req, res) => {
  try {
    const { name, email, career, profilePic, theme, accentColor, currentPassword, newPassword } = req.body
    const userId = req.userId

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })

    const data = {}

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: 'Debes proporcionar tu contraseña actual' })
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) return res.status(400).json({ error: 'Contraseña actual incorrecta' })
      data.password = await bcrypt.hash(newPassword, 10)
    }

    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) return res.status(400).json({ error: 'El correo ya está en uso' })
      data.email = email
    }

    if (name !== undefined) data.name = name
    if (career !== undefined) data.career = career
    if (profilePic !== undefined) data.profilePic = profilePic
    if (theme !== undefined) data.theme = theme
    if (accentColor !== undefined) data.accentColor = accentColor

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, name: true, email: true, career: true, profilePic: true,
        theme: true, accentColor: true, studyStreak: true, maxStreak: true,
      },
    })

    res.json(updatedUser)
  } catch (error) {
    console.error('Error en update:', error)
    res.status(500).json({ error: 'Error al actualizar el perfil' })
  }
}