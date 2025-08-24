// Controllers/orderController.js
const mongoose = require('mongoose');
const Orders   = require('../models/Orders');
const Products = require('../models/Products');
const Cart     = require('../models/Cart');

// ========== Place Order (كما هو عندك مع تحسينات طفيفة) ==========
exports.PlaceOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user?._id || req.user?.id || req.userId;
    if (!userId) {
      await session.abortTransaction(); session.endSession();
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { shippingAddress, paymentMethod } = req.body;
    if (!shippingAddress || !paymentMethod) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ message: 'shippingAddress and paymentMethod are required' });
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.product').session(session);
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // تحقق من المخزون
    for (const it of cart.items) {
      const qty = Number(it.quantity ?? 1);
      const prod = it.product;
      if (!prod?._id) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ message: 'Invalid cart item (missing product)' });
      }
      if (Number(prod.prodStock) < qty) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ message: `Insufficient stock for ${prod.prodName}` });
      }
    }

    // بنود الطلب + الإجمالي
    const items = cart.items.map((it) => ({
      product: it.product._id,
      quantity: Number(it.quantity ?? 1),
      priceAtTime: Number(it.product?.prodPrice ?? 0),
    }));
    const total = items.reduce((s, x) => s + x.priceAtTime * x.quantity, 0);

    // إنشاء الطلب
    const [order] = await Orders.create([{
      user: userId,
      items,
      total,
      shippingAddress,
      paymentMethod,
      status: 'completed',
    }], { session });

    // تنزيل المخزون
    for (const it of items) {
      const upd = await Products.updateOne(
        { _id: it.product, prodStock: { $gte: it.quantity } },
        { $inc: { prodStock: -it.quantity } }
      ).session(session);

      if (upd.matchedCount === 0 || upd.modifiedCount === 0) {
        await session.abortTransaction(); session.endSession();
        return res.status(409).json({ message: 'Stock changed while ordering. Please refresh your cart.' });
      }
    }

    // تفريغ السلة
    await Cart.deleteOne({ user: userId }).session(session);

    await session.commitTransaction(); session.endSession();

    const full = await Orders.findById(order._id).populate('items.product');
    return res.status(201).json({ message: 'Order placed successfully', order: full });
  } catch (err) {
    await session.abortTransaction(); session.endSession();
    console.error('PlaceOrder error:', err);
    return res.status(500).json({ message: 'Server error placing order', error: err.message });
  }
};

// ========== Get my orders ==========
exports.getAllOrders = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // لوجينغ بسيط للتأكد
    console.log('[getAllOrders] userId =', String(userId));

    const orders = await Orders.find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 });

    console.log('[getAllOrders] count =', orders.length);

    // رجّع Array مباشرة (الفرونت يقرأها مباشرة)
    return res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ message: 'Server error fetching orders', error: err.message });
  }
};

// ========== Admin (كما هو) ==========
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Orders.find()
      .populate('items.product')
      .populate('user');
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};
// Controllers/orderController.js
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    // طبع تشخيصي (اختياري)
    // console.log("[PATCH] id:", id, "body.status:", status);

    // طبع الحالة لـ lowercase كي نطابق الموديل
    const normalized = String(status || "").toLowerCase();
    const allowed = ['pending','processing','shipped','completed','cancelled']; // مطابق للموديل

    if (!allowed.includes(normalized)) {
      return res.status(400).json({ message: 'Invalid status value', got: status });
    }

    const updated = await Orders.findByIdAndUpdate(
      id,
      { $set: { status: normalized } },
      { new: true }
    )
      .populate('items.product')
      .populate('user');

    if (!updated) return res.status(404).json({ message: 'Order not found' });
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Error updating status', error: err.message });
  }
};
