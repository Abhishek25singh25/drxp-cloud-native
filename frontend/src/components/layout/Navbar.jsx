import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner container">
        <Link to="/" className="nav-logo">DRXP</Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Shop</NavLink>
          <NavLink to="/products?category=outerwear" className="nav-link" onClick={() => setMenuOpen(false)}>Outerwear</NavLink>
          <NavLink to="/products?tag=streetwear" className="nav-link" onClick={() => setMenuOpen(false)}>Streetwear</NavLink>
          <NavLink to="/products?featured=true" className="nav-link" onClick={() => setMenuOpen(false)}>Featured</NavLink>
        </div>

        <div className="nav-actions">
          <Link to="/cart" className="nav-icon-btn" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>

          {user ? (
            <div className="user-dropdown">
              <button className="nav-icon-btn user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <span className="user-initial">{user.name[0].toUpperCase()}</span>
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                  </div>
                  <div className="dropdown-divider" />
                  {user.isAdmin && <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Admin Panel</Link>}
                  <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>My Orders</Link>
                  <Link to="/wishlist" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Wishlist</Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Profile</Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="btn btn-outline btn-sm">Sign In</Link>
          )}

          <button className="hamburger hide-desktop" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  )
}
