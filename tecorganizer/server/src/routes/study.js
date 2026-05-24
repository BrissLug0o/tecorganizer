import { Router } from 'express'
import auth from '../middlewares/auth.js'
import { start, complete, history, uploadEvidence, upload, getByMethod} from '../controllers/studyController.js'

const router = Router()

router.use(auth)

router.get('/start', start)
router.post('/complete', complete)
router.get('/history', history)
router.post('/upload-evidence', upload.single('evidence'), uploadEvidence)
router.get('/history/:method', getByMethod)

export default router