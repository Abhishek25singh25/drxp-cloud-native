import express from 'express'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// place a new order
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body

    if (!items || items.length === 0)
      return res.status(400).json({ message: 'No items in order' })

    // recalculate totals server-side to prevent tampering
    let itemsTotal = 0
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product)
        if (!product) throw new Error(`Product ${item.product} not found`)
        itemsTotal += product.price * item.quantity
        return {
          product: product._id,
          name: product.name,
          image: product.images?.[0] || '',
          price: product.price,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        }
      })
    )

    const shippingCharge = itemsTotal >= 999 ? 0 : 99
    const grandTotal = itemsTotal + shippingCharge

    const order = await Order.create({
      user: req.user._id,
      items: enrichedItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      itemsTotal,
      shippingCharge,
      grandTotal,
    })

    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// get logged-in user's orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// get single order (user can only see their own)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) return res.status(404).json({ message: 'Order not found' })

    const isOwner = order.user._id.toString() === req.user._id.toString()
    if (!isOwner && !req.user.isAdmin)
      return res.status(403).json({ message: 'Not authorized' })

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// cancel order (user)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your order' })
    if (['shipped', 'out_for_delivery', 'delivered'].includes(order.status))
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' })

    order.status = 'cancelled'
    order.cancelReason = req.body.reason || 'Cancelled by customer'
    await order.save()
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// admin: update order status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, trackingId, estimatedDelivery } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    order.status = status || order.status
    if (trackingId) order.trackingId = trackingId
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery

    await order.save()
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
