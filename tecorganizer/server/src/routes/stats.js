import { Router } from 'express'
import auth from '../middlewares/auth.js'
import { getStats } from '../controllers/statsController.js'

const router = Router()

router.get('/', auth, getStats)

export default router