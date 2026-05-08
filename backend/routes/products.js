import express from 'express'
import Product from '../models/Product.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { q, category, gender, minPrice, maxPrice, sort, page = 1, limit = 12, featured, tag } = req.query

    const filter = {}
    if (q) filter.$text = { $search: q }
    if (category && category !== 'all') filter.category = category
    if (gender && gender !== 'all') filter.gender = { $in: [gender, 'unisex'] }
    if (featured === 'true') filter.featured = true
    if (tag) filter.tags = tag
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    const sortOptions = {
      'price-low': { price: 1 },
      'price-high': { price: -1 },
      'rating': { rating: -1 },
      'newest': { createdAt: -1 },
      'popular': { numReviews: -1 },
    }
    const sortBy = sortOptions[sort] || { createdAt: -1 }
    const skip = (Number(page) - 1) * Number(limit)

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortBy).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ])

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/featured', async (_, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(8)
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/new-arrivals', async (_, res) => {
  try {
    const products = await Product.find({ newArrival: true }).sort({ createdAt: -1 }).limit(8)
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ message: 'Product removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
