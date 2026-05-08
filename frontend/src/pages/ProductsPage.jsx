import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import ProductCard from '../components/product/ProductCard'
import './ProductsPage.css'

const CATEGORIES = ['all', 'tops', 'bottoms', 'outerwear', 'hoodies', 'streetwear', 'footwear', 'accessories']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const category = searchParams.get('category') || 'all'
  const sort = searchParams.get('sort') || 'newest'
  const page = Number(searchParams.get('page')) || 1
  const gender = searchParams.get('gender') || 'all'

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    p.set(key, val)
    if (key !== 'page') p.set('page', '1')
    setSearchParams(p)
  }

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (category !== 'all') params.category = category
    if (gender !== 'all') params.gender = gender
    if (sort) params.sort = sort
    if (page) params.page = page
    if (search) params.q = search
    params.limit = 12

    axios.get('/api/products', { params })
      .then(res => {
        setProducts(res.data.products)
        setTotal(res.data.total)
        setPages(res.data.pages)
      })
      .finally(() => setLoading(false))
  }, [category, sort, page, gender, search])

  const handleSearch = (e) => {
    e.preventDefault()
    setParam('q', search)
  }

  return (
    <div className="products-page page">
      <div className="products-header container">
        <h1>Shop All</h1>
        <p>{total} products</p>
      </div>

      <div className="products-layout container">
        {/* SIDEBAR */}
        <aside className="filters-sidebar">
          <div className="filter-group">
            <h4>Category</h4>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${category === cat ? 'active' : ''}`}
                onClick={() => setParam('category', cat)}
              >
                {cat === 'all' ? 'All Products' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <h4>Gender</h4>
            {['all', 'men', 'women', 'unisex'].map(g => (
              <button
                key={g}
                className={`filter-btn ${gender === g ? 'active' : ''}`}
                onClick={() => setParam('gender', g)}
              >
                {g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <div className="products-main">
          <div className="products-toolbar">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                className="form-input search-input"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-dark btn-sm">Search</button>
            </form>

            <select
              className="form-input sort-select"
              value={sort}
              onChange={e => setParam('sort', e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <div className="products-grid-shop">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  className={`page-btn ${page === n ? 'active' : ''}`}
                  onClick={() => setParam('page', n)}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
