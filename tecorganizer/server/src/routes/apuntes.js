import { Router } from 'express'
import auth from '../middlewares/auth.js'
import { create, getByClass, remove, upload } from '../controllers/apunteController.js'

const router = Router()

router.use(auth)

router.post('/', upload.single('image'), create)
router.get('/class/:classId', getByClass)
router.delete('/:id', remove)

export default router