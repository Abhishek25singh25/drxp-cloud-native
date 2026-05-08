import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from '../models/Product.js'
import User from '../models/User.js'

dotenv.config()

const products = [
  { name: 'Obsidian Oversized Hoodie', description: 'Heavy 450gsm fleece, dropped shoulders, kangaroo pocket. The kind of hoodie you never take off.', price: 2499, comparePrice: 3499, category: 'hoodies', gender: 'unisex', brand: 'DRXP', sizes: ['S','M','L','XL','XXL'], colors: ['Black','Charcoal','Ash'], stock: 85, tags: ['hoodie','oversized','streetwear'], featured: true, newArrival: true, isBestseller: true, images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600'] },
  { name: 'Void Cargo Pants', description: 'Multi-pocket cargos with a relaxed fit. Ripstop fabric, zippered thigh pockets, adjustable hem.', price: 3199, comparePrice: 4200, category: 'bottoms', gender: 'unisex', brand: 'DRXP', sizes: ['S','M','L','XL'], colors: ['Black','Olive','Stone'], stock: 60, tags: ['cargo','pants','streetwear'], featured: true, newArrival: true, images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'] },
  { name: 'Shadow Longline Tee', description: 'Extended length, raw hem, heavyweight 240gsm cotton. Oversized fit that layers perfectly.', price: 1299, comparePrice: 1799, category: 'tops', gender: 'unisex', brand: 'DRXP', sizes: ['XS','S','M','L','XL','XXL'], colors: ['Black','White','Washed Grey'], stock: 120, tags: ['tee','longline','oversized'], featured: true, isBestseller: true, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'] },
  { name: 'Phantom Bomber Jacket', description: 'Satin shell bomber with ribbed collar and cuffs. Loose fit, two side pockets, one chest pocket.', price: 4999, comparePrice: 6500, category: 'outerwear', gender: 'unisex', brand: 'DRXP', sizes: ['S','M','L','XL'], colors: ['All Black','Olive','Navy'], stock: 30, tags: ['bomber','jacket','outerwear'], featured: true, newArrival: true, images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600'] },
  { name: 'Stealth Joggers', description: 'Slim-tapered joggers with woven waistband. 4-way stretch fabric.', price: 2199, comparePrice: 2999, category: 'bottoms', gender: 'unisex', brand: 'DRXP', sizes: ['S','M','L','XL','XXL'], colors: ['Black','Dark Grey'], stock: 75, tags: ['joggers','pants','athleisure'], isBestseller: true, images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600'] },
  { name: 'Nocturne Coach Jacket', description: 'Lightweight nylon coach jacket. Packable, water-resistant, and full-zip.', price: 3799, comparePrice: 5000, category: 'outerwear', gender: 'unisex', brand: 'DRXP', sizes: ['S','M','L','XL'], colors: ['Black','Dark Green','Burgundy'], stock: 40, tags: ['coach jacket','nylon','outerwear'], newArrival: true, images: ['https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600'] },
  { name: 'Dark Matter Crewneck', description: 'French terry crewneck with a boxy silhouette. Slightly cropped. Minimal branding, maximum comfort.', price: 1999, comparePrice: 2699, category: 'hoodies', gender: 'unisex', brand: 'DRXP', sizes: ['XS','S','M','L','XL','XXL'], colors: ['Black','Cream','Faded Brown'], stock: 90, tags: ['crewneck','sweatshirt','streetwear'], featured: true, isBestseller: true, images: ['https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=600'] },
  { name: 'Cipher Low-Top Sneakers', description: 'Minimalist leather low-tops with gum sole. Clean enough to wear with anything.', price: 5499, comparePrice: 7000, category: 'footwear', gender: 'unisex', brand: 'DRXP', sizes: ['S','M','L','XL'], colors: ['White/Gum','All Black','Bone'], stock: 25, tags: ['sneakers','shoes','footwear'], featured: true, newArrival: true, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'] },
  { name: 'Wraith Beanie', description: 'Thick ribbed beanie with a slight slouch. One size, stretches to fit.', price: 699, comparePrice: 999, category: 'accessories', gender: 'unisex', brand: 'DRXP', sizes: ['S','M','L'], colors: ['Black','Charcoal','Cream'], stock: 150, tags: ['beanie','hat','winter'], isBestseller: true, images: ['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600'] },
  { name: 'Abyss Wide-Leg Jeans', description: 'Heavyweight denim, wide straight leg. No stretch, no nonsense.', price: 3499, comparePrice: 4500, category: 'bottoms', gender: 'unisex', brand: 'DRXP', sizes: ['XS','S','M','L','XL'], colors: ['Washed Black','Indigo','Raw Blue'], stock: 45, tags: ['jeans','denim','wide-leg'], newArrival: true, images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600'] },
  { name: 'Raven Graphic Tee', description: 'Heavy 280gsm tee with oversized front graphic. Washed and garment-dyed.', price: 1499, comparePrice: 1999, category: 'tops', gender: 'unisex', brand: 'DRXP', sizes: ['S','M','L','XL','XXL'], colors: ['Washed Black','Washed Navy','Vintage White'], stock: 100, tags: ['graphic tee','vintage','streetwear'], isBestseller: true, images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600'] },
  { name: 'Eclipse Trench Coat', description: 'Oversized trench in heavyweight wool-blend. Floor-length silhouette. Statement piece.', price: 8999, comparePrice: 12000, category: 'outerwear', gender: 'unisex', brand: 'DRXP', sizes: ['S','M','L','XL'], colors: ['Camel','All Black','Stone'], stock: 15, tags: ['trench','coat','outerwear'], featured: true, newArrival: true, images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600'] },
  { name: 'Signal Crossbody Bag', description: 'Minimal nylon crossbody with adjustable strap. Main zip + front pocket.', price: 1799, comparePrice: 2399, category: 'accessories', gender: 'unisex', brand: 'DRXP', sizes: ['S'], colors: ['Black','Grey'], stock: 40, tags: ['bag','crossbody','accessories'], isBestseller: true, images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600'] },
  { name: 'Null Tracksuit Set', description: 'Matching zip-up jacket and tapered track pants. Sold as a set.', price: 4299, comparePrice: 5800, category: 'streetwear', gender: 'unisex', brand: 'DRXP', sizes: ['S','M','L','XL','XXL'], colors: ['Black','Dark Navy','Ash Grey'], stock: 35, tags: ['tracksuit','set','athleisure'], featured: true, images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600'] },
  { name: 'Fragment Bucket Hat', description: 'Cotton twill bucket hat with a medium brim. Packed flat, bounces back.', price: 899, comparePrice: 1199, category: 'accessories', gender: 'unisex', brand: 'DRXP', sizes: ['S','M','L'], colors: ['Black','Camo','Cream'], stock: 80, tags: ['bucket hat','hat','accessories'], images: ['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600'] },
  { name: 'Asphalt Tech Shorts', description: 'Nylon tech shorts, 7 inch inseam. Zippered pockets, drawcord waist.', price: 1599, comparePrice: 2199, category: 'bottoms', gender: 'unisex', brand: 'DRXP', sizes: ['S','M','L','XL','XXL'], colors: ['Black','Olive','Grey'], stock: 65, tags: ['shorts','tech','athleisure'], newArrival: true, images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600'] },
  { name: 'Drift Zip-Up Hoodie', description: 'Mid-weight full-zip hoodie with fitted silhouette. Double-lined hood, ribbed cuffs.', price: 2799, comparePrice: 3699, category: 'hoodies', gender: 'unisex', brand: 'DRXP', sizes: ['S','M','L','XL','XXL'], colors: ['Black','Gunmetal','Washed Blue'], stock: 70, tags: ['zip hoodie','hoodie','streetwear'], isBestseller: true, images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600'] },
  { name: 'Glitch Socks 3-Pack', description: 'Crew-length ribbed cotton socks. Embroidered DRXP logo on ankle. 3 pairs.', price: 599, comparePrice: 799, category: 'accessories', gender: 'unisex', brand: 'DRXP', sizes: ['S','M','L'], colors: ['Black Pack','Mixed Pack','White Pack'], stock: 200, tags: ['socks','accessories'], images: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600'] },
  { name: 'Distortion Leather Belt', description: 'Full-grain leather with matte black roller buckle. 3.5cm width.', price: 1199, comparePrice: 1699, category: 'accessories', gender: 'unisex', brand: 'DRXP', sizes: ['S','M','L','XL'], colors: ['Black','Brown'], stock: 55, tags: ['belt','leather','accessories'], images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'] },
  { name: 'Hollow Mesh Top', description: 'Open-weave mesh layering piece. Wear solo or under a jacket.', price: 999, comparePrice: 1399, category: 'tops', gender: 'unisex', brand: 'DRXP', sizes: ['XS','S','M','L','XL'], colors: ['Black','White'], stock: 60, tags: ['mesh','top','layering'], images: ['https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?w=600'] },
]

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to DB')

    // drop the slug index cleanly before recreating
    try {
      await mongoose.connection.collection('products').dropIndex('slug_1')
      console.log('Dropped old slug index')
    } catch {
      // doesn't exist, that's fine
    }

    await Product.deleteMany()
    console.log('Cleared products')

    for (const p of products) {
      await Product.create(p)
    }
    console.log(`Seeded ${products.length} products`)

    const adminExists = await User.findOne({ isAdmin: true })
    if (!adminExists) {
      await User.create({ name: 'Admin', email: 'admin@drxp.com', password: 'admin123', isAdmin: true })
      console.log('Admin created → email: admin@drxp.com / pass: admin123')
    } else {
      console.log('Admin already exists, skipping')
    }

    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err.message)
    process.exit(1)
  }
}

seedDB()
