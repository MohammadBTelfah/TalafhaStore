const express = require('express');
const router = express.Router();
const OrderController = require('../Controllers/orderController');
const auth = require('../middleware/authMiddleware');
const AdminAuth = require('../middleware/adminAuth');

// ✅ Place order
router.post('/place-order', auth, OrderController.PlaceOrder);

// ✅ Get all orders for user
router.get('/my-orders', auth, OrderController.getAllOrders);

// ✅ Get all orders for admin
router.get('/admin/orders', AdminAuth, OrderController.getAllOrdersAdmin);

router.patch('/admin/orders/:id/status', AdminAuth, OrderController.updateOrderStatus);


module.exports = router;
