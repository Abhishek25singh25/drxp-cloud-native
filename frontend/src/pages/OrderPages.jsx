import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { format } from 'date-fns'
import './OrderPages.css'

// ─── ORDER SUCCESS ────────────────────────────────────────────────────────────
export function OrderSuccessPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    axios.get(`/api/orders/${id}`).then(r => setOrder(r.data)).catch(() => {})
  }, [id])

  return (
    <div className="order-success page">
      <div className="container">
        <div className="success-box">
          <div className="success-check">✓</div>
          <h1>Order Placed!</h1>
          {order && <p className="order-num">Order #{order.orderNumber}</p>}
          <p className="success-msg">We've received your order and it's being processed. You'll get updates as it moves through shipping.</p>
          <div className="success-actions">
            <Link to={`/orders/${id}`} className="btn btn-primary">Track Order</Link>
            <Link to="/products" className="btn btn-outline">Keep Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MY ORDERS ────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  placed: '#60a5fa', confirmed: '#a78bfa', packed: '#fbbf24',
  shipped: '#f97316', out_for_delivery: '#e8ff00', delivered: '#30d158', cancelled: '#ff3b30',
}

export function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/orders/my-orders').then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center" style={{ paddingTop: 120 }}><div className="spinner" /></div>

  return (
    <div className="orders-page page">
      <div className="container">
        <h1 className="page-heading">My Orders</h1>
        {orders.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 0', textAlign: 'center' }}>
            <h3>No orders yet</h3>
            <p style={{ color: 'var(--white-muted)', marginBottom: 24 }}>You haven't placed any orders.</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(o => (
              <Link to={`/orders/${o._id}`} key={o._id} className="order-card">
                <div className="order-card-left">
                  <p className="order-card-num">{o.orderNumber}</p>
                  <p className="order-card-date">{format(new Date(o.createdAt), 'dd MMM yyyy')}</p>
                  <p className="order-card-items">{o.items.length} item{o.items.length > 1 ? 's' : ''}</p>
                </div>
                <div className="order-card-right">
                  <p className="order-card-total">₹{o.grandTotal.toLocaleString()}</p>
                  <span className="order-status-badge" style={{ color: STATUS_COLORS[o.status] || 'var(--white-dim)', borderColor: STATUS_COLORS[o.status] || 'var(--border)' }}>
                    {o.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ORDER DETAIL ─────────────────────────────────────────────────────────────
const STEPS = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered']
const STEP_LABELS = { placed: 'Placed', confirmed: 'Confirmed', packed: 'Packed', shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered' }

export function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    axios.get(`/api/orders/${id}`).then(r => setOrder(r.data)).finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return
    setCancelling(true)
    try {
      const { data } = await axios.put(`/api/orders/${id}/cancel`, { reason: 'Cancelled by customer' })
      setOrder(data)
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot cancel at this stage')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <div className="loading-center" style={{ paddingTop: 120 }}><div className="spinner" /></div>
  if (!order) return null

  const stepIdx = STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="order-detail-page page">
      <div className="container">
        <div className="od-header">
          <div>
            <Link to="/orders" className="back-link">← My Orders</Link>
            <h1 className="page-heading">{order.orderNumber}</h1>
            <p className="od-date">Placed on {format(new Date(order.createdAt), 'dd MMMM yyyy, h:mm a')}</p>
          </div>
          {!isCancelled && !['shipped', 'out_for_delivery', 'delivered'].includes(order.status) && (
            <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>

        {/* STATUS TRACKER */}
        {!isCancelled ? (
          <div className="status-tracker">
            {STEPS.map((step, i) => (
              <div key={step} className={`tracker-step ${i <= stepIdx ? 'done' : ''} ${i === stepIdx ? 'current' : ''}`}>
                <div className="tracker-dot">
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                <span className="tracker-label">{STEP_LABELS[step]}</span>
                {i < STEPS.length - 1 && <div className={`tracker-line ${i < stepIdx ? 'done' : ''}`} />}
              </div>
            ))}
          </div>
        ) : (
          <div className="cancelled-banner">Order Cancelled {order.cancelReason ? `— ${order.cancelReason}` : ''}</div>
        )}

        {order.trackingId && (
          <div className="tracking-info">
            <span>Tracking ID:</span> <strong>{order.trackingId}</strong>
          </div>
        )}

        <div className="od-layout">
          {/* Items */}
          <div className="od-items">
            <h3>Items Ordered</h3>
            {order.items.map((item, i) => (
              <div className="od-item" key={i}>
                <div className="od-item-img">
                  <img src={item.image || 'https://via.placeholder.com/80x100?text=DRXP'} alt={item.name} />
                </div>
                <div className="od-item-info">
                  <p className="od-item-name">{item.name}</p>
                  <p className="od-item-meta">{item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`} · Qty: {item.quantity}</p>
                </div>
                <p className="od-item-price">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Address & Totals */}
          <div className="od-sidebar">
            <div className="od-box">
              <h4>Shipping Address</h4>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && <p>📞 {order.shippingAddress.phone}</p>}
            </div>
            <div className="od-box">
              <h4>Payment</h4>
              <p>{order.paymentMethod.toUpperCase()}</p>
            </div>
            <div className="od-box">
              <h4>Order Total</h4>
              <div className="od-total-rows">
                <div className="od-total-row"><span>Subtotal</span><span>₹{order.itemsTotal.toLocaleString()}</span></div>
                <div className="od-total-row"><span>Shipping</span><span>{order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span></div>
                <div className="od-total-row grand"><span>Total</span><span>₹{order.grandTotal.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
