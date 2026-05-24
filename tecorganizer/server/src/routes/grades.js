import { Router } from 'express'
import auth from '../middlewares/auth.js'
import { create, getByClass, update, remove } from '../controllers/gradeController.js'

const router = Router()
router.use(auth)

router.post('/', create)
router.get('/class/:classId', getByClass)
router.put('/:id', update)
router.delete('/:id', remove)

export default router