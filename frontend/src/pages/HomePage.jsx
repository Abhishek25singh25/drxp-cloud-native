import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import ProductCard from '../components/product/ProductCard'
import './HomePage.css'

const CATEGORIES = [
  { id: 'hoodies', label: 'Hoodies', sub: 'Stay warm, stay dark' },
  { id: 'outerwear', label: 'Outerwear', sub: 'Layer up or layer out' },
  { id: 'bottoms', label: 'Bottoms', sub: 'Cargo, denim, joggers' },
  { id: 'footwear', label: 'Footwear', sub: 'Ground yourself' },
  { id: 'accessories', label: 'Accessories', sub: 'Finish the fit' },
  { id: 'streetwear', label: 'Streetwear', sub: 'Sets & full looks' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/products/featured'),
      axios.get('/api/products/new-arrivals'),
    ]).then(([f, n]) => {
      setFeatured(f.data.slice(0, 4))
      setNewArrivals(n.data.slice(0, 4))
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="home page">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grain" />
          <div className="hero-glow" />
        </div>
        <div className="container hero-content">
          <div className="hero-eyebrow">New Collection 2025</div>
          <h1 className="hero-title">
            DRESS<br />
            <span className="hero-accent">DIFFERENT.</span><br />
            LIVE DARK.
          </h1>
          <p className="hero-sub">Unisex streetwear that doesn't apologize for itself. Bold cuts, heavy fabrics, zero compromise.</p>
          <div className="hero-ctas">
            <Link to="/products" className="btn btn-primary btn-lg">Shop All</Link>
            <Link to="/products?featured=true" className="btn btn-outline btn-lg">Featured Drops</Link>
          </div>
        </div>
        <div className="hero-scroll-hint">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {Array(8).fill(null).map((_, i) => (
            <span key={i}>DRXP &nbsp;·&nbsp; DARK FASHION &nbsp;·&nbsp; STREETWEAR &nbsp;·&nbsp; UNISEX &nbsp;·&nbsp;</span>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
          <Link to="/products" className="section-link">View All</Link>
        </div>
        <div className="categories-grid">
          {CATEGORIES.map(cat => (
            <Link key={cat.id} to={`/products?category=${cat.id}`} className="cat-card">
              <div className="cat-inner">
                <span className="cat-label">{cat.label}</span>
                <span className="cat-sub">{cat.sub}</span>
                <span className="cat-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">Featured</h2>
          <Link to="/products?featured=true" className="section-link">All Featured</Link>
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="products-grid">
            {featured.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* BANNER */}
      <section className="mid-banner container">
        <div className="mid-banner-inner">
          <div className="mid-banner-text">
            <h2>Free Shipping on orders over ₹999</h2>
            <p>No code needed. Just add to cart and go.</p>
          </div>
          <div className="mid-banner-stats">
            <div className="stat"><span>20+</span><p>Products</p></div>
            <div className="stat"><span>Free</span><p>Returns</p></div>
            <div className="stat"><span>100%</span><p>Authentic</p></div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">New Arrivals</h2>
          <Link to="/products?tag=new" className="section-link">See All</Link>
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="products-grid">
            {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* CALLOUT */}
      <section className="callout container">
        <div className="callout-inner">
          <h2>Built for the streets.<br />Made to last.</h2>
          <p>Every piece is designed with durability and aesthetics in mind. We don't do fast fashion.</p>
          <Link to="/products" className="btn btn-primary btn-lg">Explore Collection</Link>
        </div>
      </section>
    </div>
  )
}
