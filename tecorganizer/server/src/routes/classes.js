import { Router } from 'express'
import auth from '../middlewares/auth.js'
import {
  create,
  getAll,
  getById,
  update,
  remove,
  updateSyllabus,
  uploadSyllabus,
  removeSyllabus,
} from '../controllers/classController.js'

const router = Router()

router.use(auth) // Todas las rutas requieren token

router.post('/', create)
router.get('/', getAll)
router.get('/:id', getById)
router.put('/:id', update)
router.delete('/:id', remove)

// Rutas del temario (solo imágenes)
router.put('/:id/syllabus', uploadSyllabus.single('syllabus'), updateSyllabus)
router.delete('/:id/syllabus', removeSyllabus)

export default router