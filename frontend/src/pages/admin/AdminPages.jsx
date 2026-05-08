import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { format } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAuth } from '../../context/AuthContext'
import './Admin.css'

// ─── SHARED ADMIN LAYOUT ─────────────────────────────────────────────────────
function AdminLayout({ title, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">DRXP<span>Admin</span></div>
        <nav className="admin-nav">
          <Link to="/admin" className="admin-nav-link">Dashboard</Link>
          <Link to="/admin/products" className="admin-nav-link">Products</Link>
          <Link to="/admin/orders" className="admin-nav-link">Orders</Link>
          <Link to="/admin/users" className="admin-nav-link">Users</Link>
          <div className="admin-nav-divider" />
          <Link to="/" className="admin-nav-link">← Back to Store</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <p>{user?.name}</p>
          <button onClick={() => { logout(); navigate('/') }}>Sign Out</button>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-topbar"><h1>{title}</h1></div>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminLayout title="Dashboard"><div className="loading-center"><div className="spinner" /></div></AdminLayout>

  const STATUS_COLORS = { placed: '#60a5fa', confirmed: '#a78bfa', shipped: '#f97316', delivered: '#30d158', cancelled: '#ff3b30' }

  return (
    <AdminLayout title="Dashboard">
      <div className="stat-cards">
        <div className="stat-card"><span className="stat-label">Total Revenue</span><span className="stat-value">₹{stats?.totalRevenue?.toLocaleString()}</span></div>
        <div className="stat-card"><span className="stat-label">Total Orders</span><span className="stat-value">{stats?.totalOrders}</span></div>
        <div className="stat-card"><span className="stat-label">Total Users</span><span className="stat-value">{stats?.totalUsers}</span></div>
        <div className="stat-card"><span className="stat-label">Products</span><span className="stat-value">{stats?.totalProducts}</span></div>
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <h3>Orders Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.chartData || []}>
              <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
              <XAxis dataKey="_id" stroke="#555" tick={{ fontSize: 11 }} />
              <YAxis stroke="#555" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 4, fontSize: 12 }} />
              <Bar dataKey="count" fill="#e8ff00" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-card">
          <h3>Recent Orders</h3>
          <div className="recent-orders">
            {stats?.recentOrders?.map(o => (
              <Link to={`/orders/${o._id}`} key={o._id} className="recent-order-row">
                <div>
                  <p className="ro-num">{o.orderNumber}</p>
                  <p className="ro-user">{o.user?.name}</p>
                </div>
                <div className="ro-right">
                  <span style={{ color: STATUS_COLORS[o.status] || 'var(--white-dim)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{o.status}</span>
                  <span className="ro-price">₹{o.grandTotal?.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {stats?.lowStock?.length > 0 && (
        <div className="admin-card" style={{ marginTop: 20 }}>
          <h3>Low Stock Alert</h3>
          <div className="low-stock-list">
            {stats.lowStock.map(p => (
              <div key={p._id} className="low-stock-row">
                <span>{p.name}</span>
                <span style={{ color: p.stock === 0 ? 'var(--red)' : 'var(--accent)', fontWeight: 700 }}>{p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
const EMPTY_PRODUCT = { name: '', description: '', price: '', comparePrice: '', category: 'tops', gender: 'unisex', brand: 'DRXP', sizes: [], colors: '', stock: '', featured: false, isNew: false, isBestseller: false, images: [''] }
const CATEGORIES = ['tops', 'bottoms', 'outerwear', 'hoodies', 'streetwear', 'footwear', 'accessories']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

export function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [saving, setSaving] = useState(false)

  const load = () => axios.get('/api/products?limit=100').then(r => setProducts(r.data.products)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openNew = () => { setForm(EMPTY_PRODUCT); setEditing(null); setShowForm(true) }
  const openEdit = (p) => {
    setForm({ ...p, colors: p.colors?.join(', ') || '', images: p.images?.length ? p.images : [''] })
    setEditing(p._id)
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price), comparePrice: Number(form.comparePrice), stock: Number(form.stock), colors: form.colors.split(',').map(c => c.trim()).filter(Boolean), images: form.images.filter(Boolean) }
      if (editing) await axios.put(`/api/products/${editing}`, payload)
      else await axios.post('/api/products', payload)
      setShowForm(false)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await axios.delete(`/api/products/${id}`)
    load()
  }

  const toggleSize = (s) => setForm(f => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s] }))

  return (
    <AdminLayout title="Products">
      <div className="admin-toolbar">
        <span>{products.length} products</span>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Add Product</button>
      </div>

      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td><span className="table-product-name">{p.name}</span></td>
                  <td><span className="badge badge-dark">{p.category}</span></td>
                  <td>₹{p.price.toLocaleString()}</td>
                  <td><span style={{ color: p.stock === 0 ? 'var(--red)' : p.stock <= 5 ? 'var(--accent)' : 'var(--green)' }}>{p.stock}</span></td>
                  <td>{p.featured ? '✓' : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-dark btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowForm(false)} className="modal-close">✕</button>
            </div>
            <form onSubmit={handleSave} className="product-form">
              <div className="form-grid-2">
                <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div className="form-group"><label className="form-label">Brand</label><input className="form-input" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Price (₹)</label><input type="number" className="form-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required /></div>
                <div className="form-group"><label className="form-label">Compare Price (₹)</label><input type="number" className="form-input" value={form.comparePrice} onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Category</label><select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Gender</label><select className="form-input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>{['men', 'women', 'unisex'].map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Stock</label><input type="number" className="form-input" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Colors (comma separated)</label><input className="form-input" value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))} placeholder="Black, White, Grey" /></div>
              </div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Image URL</label><input className="form-input" value={form.images[0]} onChange={e => setForm(f => ({ ...f, images: [e.target.value] }))} placeholder="https://..." /></div>
              <div className="form-group">
                <label className="form-label">Sizes</label>
                <div className="sizes-toggle">
                  {SIZES.map(s => <button type="button" key={s} className={`size-toggle-btn ${form.sizes?.includes(s) ? 'active' : ''}`} onClick={() => toggleSize(s)}>{s}</button>)}
                </div>
              </div>
              <div className="form-checkboxes">
                {['featured', 'isNew', 'isBestseller'].map(field => (
                  <label key={field} className="form-checkbox">
                    <input type="checkbox" checked={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.checked }))} />
                    <span>{field === 'isNew' ? 'New Arrival' : field === 'isBestseller' ? 'Bestseller' : 'Featured'}</span>
                  </label>
                ))}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-dark" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
const STATUS_LIST = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']

export function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [filter, setFilter] = useState('')

  const load = () => axios.get(`/api/admin/orders${filter ? `?status=${filter}` : ''}`).then(r => setOrders(r.data.orders)).finally(() => setLoading(false))
  useEffect(() => { load() }, [filter])

  const handleStatusChange = async (orderId, status, trackingId) => {
    setUpdating(orderId)
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status, trackingId })
      load()
    } catch { alert('Update failed') }
    finally { setUpdating(null) }
  }

  return (
    <AdminLayout title="Orders">
      <div className="admin-toolbar">
        <div className="filter-tabs">
          {['', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} className={`filter-tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Order #</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Update</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: 12 }}>{o.orderNumber}</span></td>
                  <td><div><p style={{ fontSize: 13, fontWeight: 600 }}>{o.user?.name}</p><p style={{ fontSize: 11, color: 'var(--white-muted)' }}>{o.user?.email}</p></div></td>
                  <td style={{ fontSize: 12, color: 'var(--white-muted)' }}>{format(new Date(o.createdAt), 'dd MMM yy')}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>₹{o.grandTotal?.toLocaleString()}</td>
                  <td><span className="status-pill" style={{ '--sc': o.status === 'delivered' ? 'var(--green)' : o.status === 'cancelled' ? 'var(--red)' : o.status === 'shipped' || o.status === 'out_for_delivery' ? '#f97316' : 'var(--accent)' }}>{o.status.replace(/_/g, ' ')}</span></td>
                  <td>
                    <select
                      className="form-input"
                      style={{ padding: '6px 8px', fontSize: 12, width: 160 }}
                      value={o.status}
                      onChange={e => handleStatusChange(o._id, e.target.value)}
                      disabled={updating === o._id}
                    >
                      {STATUS_LIST.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}

// ─── USERS ────────────────────────────────────────────────────────────────────
export function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const { user: me } = useAuth()

  const load = () => axios.get('/api/admin/users').then(r => setUsers(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const toggleAdmin = async (userId, current) => {
    await axios.put(`/api/admin/users/${userId}`, { isAdmin: !current })
    load()
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return
    await axios.delete(`/api/admin/users/${userId}`)
    load()
  }

  return (
    <AdminLayout title="Users">
      <div className="admin-toolbar"><span>{users.length} registered users</span></div>
      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Admin</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</td>
                  <td style={{ fontSize: 13, color: 'var(--white-muted)' }}>{u.email}</td>
                  <td style={{ fontSize: 12, color: 'var(--white-muted)' }}>{format(new Date(u.createdAt), 'dd MMM yyyy')}</td>
                  <td><span style={{ color: u.isAdmin ? 'var(--accent)' : 'var(--white-muted)', fontWeight: 700, fontSize: 12 }}>{u.isAdmin ? 'Yes' : 'No'}</span></td>
                  <td>
                    {u._id !== me?._id && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-dark btn-sm" onClick={() => toggleAdmin(u._id, u.isAdmin)}>{u.isAdmin ? 'Remove Admin' : 'Make Admin'}</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
