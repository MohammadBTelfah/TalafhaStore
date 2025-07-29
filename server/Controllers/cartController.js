const Cart = require('../models/Cart');
const Product = require('../models/Products');

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // تحقق من صحة الـ productId والكمية
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const qty = Number(quantity) > 0 ? Number(quantity) : 1;

    // تحقق من وجود المنتج فعلاً
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // إيجاد السلة أو إنشاؤها
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // تحقق إذا المنتج موجود مسبقاً بالسلة
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();
    res.status(200).json({ message: 'Item added to cart successfully', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get cart items
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ message: 'Cart is empty', items: [] });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving cart', error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    await cart.save();
    res.status(200).json({ message: 'Item removed from cart successfully', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
};
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity);

    if (!productId || !mongoose.Types.ObjectId.isValid(productId) || qty < 1) {
      return res.status(400).json({ message: 'Invalid product or quantity' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find((item) => item.product.toString() === productId.toString());
    if (!item) return res.status(404).json({ message: 'Product not in cart' });

    item.quantity = qty;
    await cart.save();

    res.status(200).json({ message: 'Cart item updated', cart });
  } catch (err) {
    res.status(500).json({ message: 'Error updating cart', error: err.message });
  }
};
