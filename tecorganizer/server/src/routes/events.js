import { Router } from 'express'
import auth from '../middlewares/auth.js'
import { create, getAll, update, remove } from '../controllers/eventController.js'

const router = Router()
router.use(auth)

router.post('/', create)
router.get('/', getAll)
router.put('/:id', update)
router.delete('/:id', remove)

export default router