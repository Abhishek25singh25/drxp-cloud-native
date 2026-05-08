import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './CartPage.css'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal, shippingCharge, grandTotal, totalItems } = useCart()

  if (items.length === 0) return (
    <div className="cart-empty page">
      <div className="container">
        <div className="empty-cart-box">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="cart-page page">
      <div className="container">
        <h1 className="cart-title">Your Cart <span>({totalItems} items)</span></h1>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {items.map(item => {
              const { product, quantity, size, color } = item
              const key = `${product._id}-${size}-${color}`
              return (
                <div className="cart-item" key={key}>
                  <div className="cart-item-img">
                    <img src={product.images?.[0] || 'https://via.placeholder.com/100x120?text=DRXP'} alt={product.name} />
                  </div>
                  <div className="cart-item-info">
                    <p className="ci-brand">{product.brand}</p>
                    <h3 className="ci-name">{product.name}</h3>
                    <div className="ci-variants">
                      {size && <span>Size: {size}</span>}
                      {color && <span>Color: {color}</span>}
                    </div>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-control">
                      <button onClick={() => updateQuantity(product._id, size, color, quantity - 1)}>−</button>
                      <span>{quantity}</span>
                      <button onClick={() => updateQuantity(product._id, size, color, quantity + 1)}>+</button>
                    </div>
                    <p className="ci-price">₹{(product.price * quantity).toLocaleString()}</p>
                    <button className="remove-btn" onClick={() => removeFromCart(product._id, size, color)}>Remove</button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shippingCharge === 0 ? <span style={{ color: 'var(--green)' }}>FREE</span> : `₹${shippingCharge}`}</span>
              </div>
              {shippingCharge > 0 && (
                <p className="free-shipping-note">Add ₹{(999 - subtotal).toLocaleString()} more for free shipping</p>
              )}
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }}>
              Proceed to Checkout
            </Link>
            <Link to="/products" className="btn btn-ghost" style={{ width: '100%', marginTop: 8, textAlign: 'center' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
