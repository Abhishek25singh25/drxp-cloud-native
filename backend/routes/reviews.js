import express from 'express'
import Review from '../models/Review.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, title, body } = req.body

    const existing = await Review.findOne({ user: req.user._id, product: productId })
    if (existing) return res.status(400).json({ message: 'You have already reviewed this product' })

    // check if user actually bought it
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      status: 'delivered',
    })

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      title,
      body,
      verifiedPurchase: !!hasPurchased,
    })

    // update product rating average
    const allReviews = await Review.find({ product: productId })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      numReviews: allReviews.length,
    })

    const populated = await review.populate('user', 'name avatar')
    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ message: 'Review not found' })

    const isOwner = review.user.toString() === req.user._id.toString()
    if (!isOwner && !req.user.isAdmin)
      return res.status(403).json({ message: 'Not authorized' })

    await review.deleteOne()

    // recalculate rating
    const remaining = await Review.find({ product: review.product })
    const newAvg = remaining.length
      ? remaining.reduce((s, r) => s + r.rating, 0) / remaining.length
      : 0

    await Product.findByIdAndUpdate(review.product, {
      rating: Math.round(newAvg * 10) / 10,
      numReviews: remaining.length,
    })

    res.json({ message: 'Review deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
