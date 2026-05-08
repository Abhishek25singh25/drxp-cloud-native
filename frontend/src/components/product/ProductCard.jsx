import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [wishlisted, setWishlisted] = useState(false)
  const [imgErr, setImgErr] = useState(false)

  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!user) return toast('Sign in to save items', 'error')
    try {
      await axios.post(`/api/wishlist/toggle/${product._id}`)
      setWishlisted(!wishlisted)
      toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist')
    } catch {
      toast('Something went wrong', 'error')
    }
  }

  const handleQuickAdd = (e) => {
    e.preventDefault()
    addToCart(product, 1, product.sizes?.[0] || '', product.colors?.[0] || '')
    toast(`${product.name} added to cart`)
  }

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="card-image-wrap">
        {!imgErr ? (
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400x500?text=DRXP'}
            alt={product.name}
            className="card-image"
            onError={() => setImgErr(true)}
            loading="lazy"
          />
        ) : (
          <div className="card-image-fallback">
            <span>DRXP</span>
          </div>
        )}

        <div className="card-badges">
          {product.isNew && <span className="badge badge-new">New</span>}
          {product.isBestseller && <span className="badge badge-hot">Hot</span>}
          {discount > 0 && <span className="badge badge-sale">-{discount}%</span>}
        </div>

        <div className="card-actions">
          <button className={`wishlist-btn ${wishlisted ? 'active' : ''}`} onClick={handleWishlist} title="Wishlist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <button className="quick-add-btn" onClick={handleQuickAdd}>Quick Add</button>
        </div>

        {product.stock === 0 && <div className="out-of-stock-overlay">Out of Stock</div>}
      </div>

      <div className="card-info">
        <p className="card-brand">{product.brand}</p>
        <h3 className="card-name">{product.name}</h3>
        <div className="card-colors">
          {product.colors?.slice(0, 4).map(c => (
            <span key={c} className="color-dot" title={c} style={{ background: c.toLowerCase().includes('black') ? '#111' : c.toLowerCase().includes('white') ? '#f0f0f0' : c.toLowerCase().includes('grey') || c.toLowerCase().includes('gray') ? '#888' : c.toLowerCase().includes('olive') ? '#6b7c4a' : c.toLowerCase().includes('red') ? '#c0392b' : c.toLowerCase().includes('blue') ? '#2980b9' : c.toLowerCase().includes('cream') ? '#f5f0e8' : c.toLowerCase().includes('brown') ? '#7b5e42' : '#555' }} />
          ))}
          {product.colors?.length > 4 && <span className="color-more">+{product.colors.length - 4}</span>}
        </div>
        <div className="card-price">
          <span className="price-current">₹{product.price.toLocaleString()}</span>
          {product.comparePrice > product.price && (
            <span className="price-original">₹{product.comparePrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
