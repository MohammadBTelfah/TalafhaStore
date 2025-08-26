require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
require('./middleware/googleAuth'); // ✅ Google OAuth

const userRoutes = require('./Routes/userRoutes');
const productRoutes = require('./Routes/productRoutes');
const categoryRoutes = require('./Routes/categoryRoutes');
const CartRoutes = require('./Routes/CartRoutes');
const OrderRoutes = require('./Routes/orderRoutes');
const contactRoutes = require('./Routes/ContactRoutes');
const adminStatsRoutes = require('./Routes/adminStatsRoutes');

const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5002;

// ✅ لو عندك بروكسي (Nginx/Render) خلّي الإكسبريس يثق بالهيدر
app.set('trust proxy', 1);

// ✅ CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    /\.vercel\.app$/,
    'https://talafha-store.vercel.app'
  ],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// ✅ Session (لـ passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecret',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ تجهيز مجلد الرفع بمسار مطلق + إنشاؤه إن لم يكن موجود
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ✅ خدمة ملفات الصور الستاتيكية من /uploads عبر المسار المطلق
app.use('/uploads', express.static(UPLOADS_DIR, {
  index: false,
  etag: true,
  maxAge: '1d', // غيّر المدة حسب حاجتك
}));

// ✅ Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', CartRoutes);
app.use('/api/orders', OrderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin/stats', adminStatsRoutes);

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

// ✅ Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
