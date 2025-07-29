const express = require('express');
const router = express.Router();
const CartController = require('../Controllers/cartController');
const auth = require('../middleware/authMiddleware');

// ✅ Add to cart
router.post('/add-to-cart', auth, CartController.addToCart);

// ✅ Get cart items
router.get('/get-cart', auth, CartController.getCart);

// ✅ Remove item from cart
router.delete('/remove-from-cart', auth, CartController.removeFromCart);

// ✅ Update item quantity in cart
router.put('/update-cart-item', auth, CartController.updateCartItemQuantity);

module.exports = router;
