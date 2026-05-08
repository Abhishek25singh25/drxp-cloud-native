import express from 'express'
import multer from 'multer'
import path from 'path'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname)
    cb(null, `product-${Date.now()}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/
  const isValid = allowed.test(path.extname(file.originalname).toLowerCase())
  if (isValid) cb(null, true)
  else cb(new Error('Only image files are allowed'))
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })

router.post('/', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
  res.json({ url: `/uploads/${req.file.filename}` })
})

export default router
