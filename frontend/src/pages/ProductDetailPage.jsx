import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './ProductDetailPage.css'

const Stars = ({ rating, size = 16 }) => (
  <div className="stars">
    {[1, 2, 3, 4, 5].map(n => (
      <svg key={n} width={size} height={size} viewBox="0 0 24 24" fill={n <= Math.round(rating) ? '#e8ff00' : 'none'} stroke={n <= Math.round(rating) ? '#e8ff00' : '#333'} strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
)

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [tab, setTab] = useState('description')
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    Promise.all([
      axios.get(`/api/products/${id}`),
      axios.get(`/api/reviews/product/${id}`),
    ]).then(([pRes, rRes]) => {
      setProduct(pRes.data)
      setReviews(rRes.data)
      setSelectedSize(pRes.data.sizes?.[0] || '')
      setSelectedColor(pRes.data.colors?.[0] || '')
    }).catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (!selectedSize) return toast('Please select a size', 'error')
    addToCart(product, qty, selectedSize, selectedColor)
    toast(`${product.name} added to cart`)
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!user) return toast('Sign in to leave a review', 'error')
    setSubmittingReview(true)
    try {
      const { data } = await axios.post('/api/reviews', { productId: id, ...reviewForm })
      setReviews(prev => [data, ...prev])
      setReviewForm({ rating: 5, title: '', body: '' })
      toast('Review posted!')
    } catch (err) {
      toast(err.response?.data?.message || 'Could not post review', 'error')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`/api/reviews/${reviewId}`)
      setReviews(prev => prev.filter(r => r._id !== reviewId))
      toast('Review deleted')
    } catch {
      toast('Failed to delete', 'error')
    }
  }

  const discount = product?.comparePrice > product?.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  if (loading) return <div className="loading-center" style={{ paddingTop: 120 }}><div className="spinner" /></div>
  if (!product) return null

  return (
    <div className="pdp page">
      <div className="container pdp-layout">
        {/* LEFT: Images */}
        <div className="pdp-images">
          <div className="pdp-main-img">
            <img src={product.images?.[activeImg] || 'https://via.placeholder.com/600x750?text=DRXP'} alt={product.name} />
            {product.isNew && <span className="badge badge-new pdp-badge">New</span>}
          </div>
          {product.images?.length > 1 && (
            <div className="pdp-thumbs">
              {product.images.map((img, i) => (
                <button key={i} className={`pdp-thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                  <img src={img} alt={`View ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Info */}
        <div className="pdp-info">
          <p className="pdp-brand">{product.brand}</p>
          <h1 className="pdp-name">{product.name}</h1>

          <div className="pdp-rating-row">
            <Stars rating={product.rating} />
            <span className="pdp-rating-count">{product.rating > 0 ? `${product.rating} (${product.numReviews} reviews)` : 'No reviews yet'}</span>
          </div>

          <div className="pdp-price-row">
            <span className="pdp-price">₹{product.price.toLocaleString()}</span>
            {product.comparePrice > product.price && (
              <>
                <span className="pdp-compare">₹{product.comparePrice.toLocaleString()}</span>
                <span className="badge badge-sale">{discount}% OFF</span>
              </>
            )}
          </div>

          <div className="pdp-divider" />

          {/* Size */}
          {product.sizes?.length > 0 && (
            <div className="pdp-option-group">
              <div className="pdp-option-header">
                <span>Size</span>
                <span className="pdp-selected-val">{selectedSize}</span>
              </div>
              <div className="size-grid">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    className={`size-btn ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          {product.colors?.length > 0 && (
            <div className="pdp-option-group">
              <div className="pdp-option-header">
                <span>Color</span>
                <span className="pdp-selected-val">{selectedColor}</span>
              </div>
              <div className="color-grid">
                {product.colors.map(c => (
                  <button
                    key={c}
                    className={`color-choice ${selectedColor === c ? 'active' : ''}`}
                    onClick={() => setSelectedColor(c)}
                    title={c}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Add */}
          <div className="pdp-actions">
            <div className="qty-control">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          <div className="pdp-meta">
            <p><span>Category:</span> {product.category}</p>
            <p><span>Gender:</span> {product.gender}</p>
            <p><span>Stock:</span> {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}</p>
            {product.tags?.length > 0 && (
              <p><span>Tags:</span> {product.tags.join(', ')}</p>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="container pdp-tabs-section">
        <div className="pdp-tabs">
          {['description', 'specs', 'reviews'].map(t => (
            <button key={t} className={`pdp-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'reviews' ? `Reviews (${reviews.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="pdp-tab-content">
          {tab === 'description' && (
            <p className="pdp-desc">{product.description}</p>
          )}

          {tab === 'specs' && (
            product.specifications?.length > 0 ? (
              <table className="specs-table">
                <tbody>
                  {product.specifications.map((s, i) => (
                    <tr key={i}>
                      <td>{s.key}</td>
                      <td>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: 'var(--white-muted)' }}>No specifications listed.</p>
          )}

          {tab === 'reviews' && (
            <div className="reviews-section">
              {/* Review form */}
              {user && (
                <form className="review-form" onSubmit={handleReviewSubmit}>
                  <h3>Write a Review</h3>
                  <div className="review-stars-input">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill={n <= reviewForm.rating ? '#e8ff00' : 'none'} stroke={n <= reviewForm.rating ? '#e8ff00' : '#333'} strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <input className="form-input" placeholder="Review title" value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} required />
                  <textarea className="form-input" placeholder="Tell us what you think..." value={reviewForm.body} onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))} required />
                  <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                    {submittingReview ? 'Posting...' : 'Post Review'}
                  </button>
                </form>
              )}

              {reviews.length === 0 ? (
                <p style={{ color: 'var(--white-muted)', padding: '24px 0' }}>No reviews yet. Be the first.</p>
              ) : (
                <div className="reviews-list">
                  {reviews.map(r => (
                    <div key={r._id} className="review-card">
                      <div className="review-header">
                        <div>
                          <Stars rating={r.rating} size={14} />
                          <h4>{r.title}</h4>
                        </div>
                        <div className="review-meta">
                          <span>{r.user?.name}</span>
                          {r.verifiedPurchase && <span className="badge badge-new" style={{ fontSize: 9 }}>Verified</span>}
                          {(user?._id === r.user?._id || user?.isAdmin) && (
                            <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => handleDeleteReview(r._id)}>Delete</button>
                          )}
                        </div>
                      </div>
                      <p className="review-body">{r.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
