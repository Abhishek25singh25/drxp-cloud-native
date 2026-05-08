import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, sparse: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, default: 0 },
    category: {
      type: String,
      required: true,
      enum: ['tops', 'bottoms', 'outerwear', 'footwear', 'accessories', 'hoodies', 'streetwear'],
    },
    gender: {
      type: String,
      enum: ['men', 'women', 'unisex'],
      default: 'unisex',
    },
    brand: { type: String, default: 'DRXP' },
    images: [{ type: String }],
    sizes: [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] }],
    colors: [{ type: String }],
    stock: { type: Number, default: 0 },
    tags: [String],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
  },
  { timestamps: true }
)

productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' })

productSchema.pre('save', function (next) {
  if (this.isModified('name') && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()
  }
  next()
})

export default mongoose.model('Product', productSchema)
