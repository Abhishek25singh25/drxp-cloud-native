import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './CheckoutPage.css'

export default function CheckoutPage() {
  const { items, subtotal, shippingCharge, grandTotal, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [payMethod, setPayMethod] = useState('cod')

  const saved = user?.savedAddress || {}
  const [addr, setAddr] = useState({
    fullName: saved.fullName || user?.name || '',
    phone: saved.phone || '',
    street: saved.street || '',
    city: saved.city || '',
    state: saved.state || '',
    zip: saved.zip || '',
    country: 'India',
  })

  const handleChange = (e) => setAddr(a => ({ ...a, [e.target.name]: e.target.value }))

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (items.length === 0) return toast('Your cart is empty', 'error')
    setPlacing(true)
    try {
      const orderItems = items.map(i => ({
        product: i.product._id,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      }))
      const { data } = await axios.post('/api/orders', {
        items: orderItems,
        shippingAddress: addr,
        paymentMethod: payMethod,
      })
      clearCart()
      navigate(`/order-success/${data._id}`)
    } catch (err) {
      toast(err.response?.data?.message || 'Order failed. Try again.', 'error')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="checkout-page page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handlePlaceOrder}>
            <div className="checkout-section">
              <h3>Shipping Address</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input name="fullName" className="form-input" value={addr.fullName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input name="phone" className="form-input" value={addr.phone} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input name="street" className="form-input" value={addr.street} onChange={handleChange} required />
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input name="city" className="form-input" value={addr.city} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input name="state" className="form-input" value={addr.state} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP / Pincode</label>
                  <input name="zip" className="form-input" value={addr.zip} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="checkout-section">
              <h3>Payment Method</h3>
              <div className="pay-options">
                {[
                  { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives' },
                  { id: 'upi', label: 'UPI', sub: 'Pay instantly via any UPI app' },
                  { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay' },
                ].map(opt => (
                  <label key={opt.id} className={`pay-option ${payMethod === opt.id ? 'active' : ''}`}>
                    <input type="radio" name="payment" value={opt.id} checked={payMethod === opt.id} onChange={() => setPayMethod(opt.id)} />
                    <div>
                      <p className="pay-label">{opt.label}</p>
                      <p className="pay-sub">{opt.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg place-order-btn" disabled={placing}>
              {placing ? 'Placing Order...' : `Place Order — ₹${grandTotal.toLocaleString()}`}
            </button>
          </form>

          {/* Order summary */}
          <div className="checkout-summary">
            <h3>Order Summary</h3>
            <div className="checkout-items">
              {items.map(item => (
                <div className="co-item" key={`${item.product._id}-${item.size}-${item.color}`}>
                  <div className="co-img">
                    <img src={item.product.images?.[0] || ''} alt={item.product.name} />
                    <span className="co-qty">{item.quantity}</span>
                  </div>
                  <div className="co-info">
                    <p className="co-name">{item.product.name}</p>
                    <p className="co-variant">{item.size} {item.color && `· ${item.color}`}</p>
                  </div>
                  <p className="co-price">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="co-totals">
              <div className="co-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="co-row"><span>Shipping</span><span>{shippingCharge === 0 ? <b style={{ color: 'var(--green)' }}>FREE</b> : `₹${shippingCharge}`}</span></div>
              <div className="co-row total"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
