const express = require('express');
const router = express.Router();
const productController = require('../Controllers/productController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});
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
