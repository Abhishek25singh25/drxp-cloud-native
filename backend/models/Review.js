import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    body: { type: String, required: true, maxlength: 1500 },
    verifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true })

export default mongoose.model('Review', reviewSchema)
