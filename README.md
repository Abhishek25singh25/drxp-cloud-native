<<<<<<< HEAD
# DRXP — Dark Fashion E-Commerce

Full-stack MERN e-commerce platform for unisex streetwear.

## Stack
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- **Frontend**: React 18, React Router, Axios, Recharts

## Features
- Product listings with search, filter by category/gender, sort
- Product detail page with size/color picker, image gallery, reviews
- Shopping cart (persisted in localStorage)
- Checkout with address form and payment method selection
- Order tracking with live status updates (7 steps)
- Wishlist (per user, synced to DB)
- User auth — register/login, profile management, saved address
- Reviews with verified purchase badge
- Full admin panel: dashboard stats, product CRUD, order management, user management

## Setup

### 1. Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm install
npm run seed    # seeds 20 products + creates admin account
npm run dev
```

Admin credentials after seeding:
- Email: `admin@drxp.com`
- Password: `admin123`

### 2. Frontend
```bash
cd frontend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## .env Variables (backend only)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/drxp
JWT_SECRET=any_random_string_you_make_up
CLIENT_URL=http://localhost:3000
```

## API Routes
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | — | Register |
| POST | /api/auth/login | — | Login |
| GET | /api/products | — | List/search products |
| GET | /api/products/:id | — | Single product |
| POST | /api/orders | User | Place order |
| GET | /api/orders/my-orders | User | My orders |
| POST | /api/wishlist/toggle/:id | User | Toggle wishlist |
| GET | /api/admin/stats | Admin | Dashboard stats |
| PUT | /api/orders/:id/status | Admin | Update order status |
=======
# drxp-cloud-native
>>>>>>> d8f8cf11ff05e4f39d2d1b519e6b7f662e956d61
