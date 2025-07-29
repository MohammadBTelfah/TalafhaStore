require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const userRoutes = require('./Routes/userRoutes');
const productRoutes = require('./Routes/productRoutes');
const categoryRoutes = require('./Routes/categoryRoutes');
const CartRoutes = require('./Routes/CartRoutes'); // ✅ استيراد CartRoutes
const OrderRoutes = require('./Routes/orderRoutes'); // ✅ استيراد OrderRoutes  

const path = require('path');
const cors = require('cors'); // ✅ استيراد cors

const app = express();
const PORT = process.env.PORT || 5002;

// ✅ CORS config (تسمح بطلبات من frontend مثل React)
app.use(cors({
  origin: 'http://localhost:3000', // غيّرها لدومين تطبيقك إذا لزم
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (profile images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport
require('./middleware/passport');
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', CartRoutes); // ✅ إضافة CartRoutes
app.use('/api/orders', OrderRoutes); // ✅ إضافة OrderRoutes

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
