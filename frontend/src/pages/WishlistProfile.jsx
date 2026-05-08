import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import ProductCard from '../components/product/ProductCard'
import './WishlistProfile.css'

export function WishlistPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/wishlist').then(r => setProducts(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center" style={{ paddingTop: 120 }}><div className="spinner" /></div>

  return (
    <div className="wishlist-page page">
      <div className="container">
        <h1 className="page-heading">Wishlist</h1>
        {products.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '60px 0' }}>
            <h3>Your wishlist is empty</h3>
            <p style={{ color: 'var(--white-muted)', marginBottom: 24 }}>Save items you love and come back to them later.</p>
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export function ProfilePage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', savedAddress: { fullName: '', phone: '', street: '', city: '', state: '', zip: '' } })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get('/api/auth/me').then(r => {
      const u = r.data.user
      setForm(f => ({
        ...f,
        name: u.name || '',
        email: u.email || '',
        savedAddress: u.savedAddress || f.savedAddress,
      }))
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const payload = { name: form.name, email: form.email, savedAddress: form.savedAddress }
      if (form.password) payload.password = form.password
      await axios.put('/api/auth/profile', payload)
      setSuccess(true)
      setForm(f => ({ ...f, password: '' }))
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const setAddr = (field, val) => setForm(f => ({ ...f, savedAddress: { ...f.savedAddress, [field]: val } }))

  return (
    <div className="profile-page page">
      <div className="container">
        <h1 className="page-heading">My Profile</h1>
        <div className="profile-layout">
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-section">
              <h3>Personal Info</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">New Password (leave blank to keep current)</label>
                <input type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
            </div>

            <div className="profile-section">
              <h3>Saved Address</h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.savedAddress.fullName} onChange={e => setAddr('fullName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.savedAddress.phone} onChange={e => setAddr('phone', e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Street</label>
                <input className="form-input" value={form.savedAddress.street} onChange={e => setAddr('street', e.target.value)} />
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={form.savedAddress.city} onChange={e => setAddr('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" value={form.savedAddress.state} onChange={e => setAddr('state', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP</label>
                  <input className="form-input" value={form.savedAddress.zip} onChange={e => setAddr('zip', e.target.value)} />
                </div>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">Profile updated successfully.</div>}
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>

          <div className="profile-sidebar">
            <div className="profile-quick-links">
              <h4>Quick Links</h4>
              <Link to="/orders" className="pql-item">My Orders</Link>
              <Link to="/wishlist" className="pql-item">Wishlist</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
