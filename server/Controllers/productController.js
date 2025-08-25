const Product = require('../models/Products');
const path = require('path');

// ✅ Create product
exports.createProduct = async (req, res) => {
  try {
    const {
      prodName,
      prodPrice,
      prodDescription,
      prodCategory,
      prodStock,
      prodBrand,
      discount,
      isFeatured
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    // 🔗 توليد رابط عام كامل للصورة (يدعم البروكسي)
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const prodImage = `${protocol}://${host}/uploads/${req.file.filename}`;

    const product = new Product({
      prodName,
      prodPrice,
      prodDescription,
      prodCategory,
      prodStock,
      prodImage, // ← URL كامل
      prodBrand,
      discount: Number(discount),
      isFeatured: isFeatured === 'true'
    });

    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    console.error("🔥 ERROR CREATING PRODUCT:", err);
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
};

// ✅ Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('prodCategory');
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
};

// ✅ Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('prodCategory');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
};

// ✅ Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      prodName,
      prodPrice,
      prodDescription,
      prodCategory,
      prodStock,
      prodBrand,
      discount,
      isFeatured
    } = req.body;

    const updateData = {
      prodName,
      prodPrice,
      prodDescription,
      prodCategory,
      prodStock,
      prodBrand,
      discount: Number(discount),
      isFeatured: isFeatured === 'true'
    };

    if (req.file) {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      updateData.prodImage = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
};

// ✅ Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};
// ✅ Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
const products = await Product.find({ isFeatured: true })
  .limit(6)
  .populate('prodCategory');
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching featured products', error: err.message });
  }
};

