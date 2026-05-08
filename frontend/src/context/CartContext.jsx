import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

const loadCart = () => {
  try { return JSON.parse(localStorage.getItem('drxp_cart')) || [] } catch { return [] }
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    localStorage.setItem('drxp_cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product, quantity = 1, size = '', color = '') => {
    setItems(prev => {
      const key = `${product._id}-${size}-${color}`
      const exists = prev.find(i => `${i.product._id}-${i.size}-${i.color}` === key)
      if (exists) {
        return prev.map(i =>
          `${i.product._id}-${i.size}-${i.color}` === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { product, quantity, size, color }]
    })
  }

  const removeFromCart = (productId, size, color) => {
    setItems(prev => prev.filter(i => !(i.product._id === productId && i.size === size && i.color === color)))
  }

  const updateQuantity = (productId, size, color, quantity) => {
    if (quantity < 1) return removeFromCart(productId, size, color)
    setItems(prev =>
      prev.map(i =>
        i.product._id === productId && i.size === size && i.color === color
          ? { ...i, quantity }
          : i
      )
    )
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const shippingCharge = subtotal >= 999 ? 0 : 99
  const grandTotal = subtotal + shippingCharge

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart,
      totalItems, subtotal, shippingCharge, grandTotal
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
