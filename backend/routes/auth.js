import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const makeToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' })

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' })

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password })
    res.status(201).json({
      token: makeToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' })

    res.json({
      token: makeToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/me', protect, (req, res) => {
  res.json({ user: req.user })
})

router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const { name, email, password, savedAddress } = req.body

    if (name) user.name = name
    if (email) user.email = email
    if (password) user.password = password
    if (savedAddress) user.savedAddress = savedAddress

    await user.save()
    res.json({
      user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, savedAddress: user.savedAddress },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
