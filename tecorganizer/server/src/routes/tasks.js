import { Router } from 'express'
import auth from '../middlewares/auth.js'
import { create, getByClass, update, remove } from '../controllers/taskController.js'

const router = Router({ mergeParams: true })

router.use(auth)

router.post('/', create)
router.get('/class/:classId', getByClass)
router.put('/:id', update)
router.delete('/:id', remove)

export default router