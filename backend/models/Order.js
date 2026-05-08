import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  size: String,
  color: String,
  quantity: { type: Number, required: true, min: 1 },
})

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: String,
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      zip: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    paymentMethod: { type: String, default: 'cod' },
    itemsTotal: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },
    trackingId: { type: String, default: '' },
    estimatedDelivery: { type: Date },
    cancelReason: { type: String, default: '' },
  },
  { timestamps: true }
)

// generate order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments()
    this.orderNumber = `DRXP${String(count + 1).padStart(5, '0')}`
  }
  next()
})

export default mongoose.model('Order', orderSchema)
