import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">DRXP</div>
          <p>Dark fashion for those who don't follow rules. Unisex streetwear built to last.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Instagram" className="social-link">IG</a>
            <a href="#" aria-label="Twitter" className="social-link">TW</a>
            <a href="#" aria-label="Pinterest" className="social-link">PT</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/products?category=hoodies">Hoodies</Link>
          <Link to="/products?category=outerwear">Outerwear</Link>
          <Link to="/products?category=bottoms">Bottoms</Link>
          <Link to="/products?category=footwear">Footwear</Link>
          <Link to="/products?category=accessories">Accessories</Link>
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/auth">Sign In</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/profile">Profile</Link>
        </div>

        <div className="footer-col">
          <h4>Info</h4>
          <a href="#">Size Guide</a>
          <a href="#">Shipping Info</a>
          <a href="#">Returns</a>
          <a href="#">Contact</a>
        </div>
      </div>

      <div className="footer-bottom container">
        <p>© {new Date().getFullYear()} DRXP. All rights reserved.</p>
        <div className="payment-icons">
          <span>VISA</span><span>MC</span><span>UPI</span><span>COD</span>
        </div>
      </div>
    </footer>
  )
}
