require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
require('./middleware/googleAuth'); // ✅ استيراد إعدادات Google OAuth


const userRoutes = require('./Routes/userRoutes');
const productRoutes = require('./Routes/productRoutes');
const categoryRoutes = require('./Routes/categoryRoutes');
const CartRoutes = require('./Routes/CartRoutes');
const OrderRoutes = require('./Routes/orderRoutes');
const contactRoutes = require('./Routes/ContactRoutes');


const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5002;

// ✅ CORS config
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// ✅ جلسة المستخدم (ضروري لـ passport)
app.use(session({
  secret: 'yourSecret',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve profile images
app.use('/uploads', express.static('uploads'));

// ✅ Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', CartRoutes);
app.use('/api/orders', OrderRoutes);
app.use('/api/contact', contactRoutes); // 👈 add this line


// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
