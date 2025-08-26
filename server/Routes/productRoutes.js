const express = require('express');
const router = express.Router();
const productController = require('../Controllers/productController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');


const storage = multer.memoryStorage();

// Multer instance
const upload = multer({ storage });


// ✅ Create product
router.post('/create', auth, upload.single('prodImage'), productController.createProduct);

// ✅ Get all products
router.get('/getall', productController.getAllProducts);
// ✅ Get product by ID
router.get('/get/:id', productController.getProductById);
// ✅ Update product
router.put('/update/:id', auth, upload.single('prodImage'), productController.updateProduct);
// ✅ Delete product
router.delete('/delete/:id', auth, productController.deleteProduct);
// ✅ Get featured products
router.get('/featured', productController.getFeaturedProducts);
module.exports = router;
