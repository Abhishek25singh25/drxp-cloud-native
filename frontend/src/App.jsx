import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import { OrderSuccessPage, OrdersPage, OrderDetailPage } from './pages/OrderPages'
import { WishlistPage, ProfilePage } from './pages/WishlistProfile'
import AuthPage from './pages/AuthPage'
import { AdminDashboard, AdminProducts, AdminOrders, AdminUsers } from './pages/admin/AdminPages'
import NotFoundPage from './pages/NotFoundPage'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-center"><div className="spinner" /></div>
  return user ? children : <Navigate to="/auth" />
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-center"><div className="spinner" /></div>
  if (!user) return <Navigate to="/auth" />
  if (!user.isAdmin) return <Navigate to="/" />
  return children
}

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />

              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
              <Route path="/products/:id" element={<Layout><ProductDetailPage /></Layout>} />
              <Route path="/cart" element={<Layout><CartPage /></Layout>} />

              <Route path="/checkout" element={<PrivateRoute><Layout><CheckoutPage /></Layout></PrivateRoute>} />
              <Route path="/order-success/:id" element={<PrivateRoute><Layout><OrderSuccessPage /></Layout></PrivateRoute>} />
              <Route path="/orders" element={<PrivateRoute><Layout><OrdersPage /></Layout></PrivateRoute>} />
              <Route path="/orders/:id" element={<PrivateRoute><Layout><OrderDetailPage /></Layout></PrivateRoute>} />
              <Route path="/wishlist" element={<PrivateRoute><Layout><WishlistPage /></Layout></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />

              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

              <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
