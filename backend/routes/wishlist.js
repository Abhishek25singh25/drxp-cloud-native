import express from 'express'
import Wishlist from '../models/Wishlist.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products')
    res.json(wishlist ? wishlist.products : [])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/toggle/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params
    let wishlist = await Wishlist.findOne({ user: req.user._id })

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [productId] })
      return res.json({ added: true, message: 'Added to wishlist' })
    }

    const idx = wishlist.products.indexOf(productId)
    if (idx === -1) {
      wishlist.products.push(productId)
      await wishlist.save()
      return res.json({ added: true, message: 'Added to wishlist' })
    } else {
      wishlist.products.splice(idx, 1)
      await wishlist.save()
      return res.json({ added: false, message: 'Removed from wishlist' })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
