import { Router } from 'express'
import auth from '../middlewares/auth.js'
import { register, login, me, update, uploadProfilePic, upload } from '../controllers/authController.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', auth, me)
router.put('/update', auth, update)
router.post('/upload-profile-pic', auth, upload.single('profilePic'), uploadProfilePic)

export default router