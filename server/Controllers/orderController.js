// controllers/orderController.js
const mongoose = require('mongoose');
const Orders = require('../models/Orders');
const Products = require('../models/Products'); // موديـل المنتجات اسمه "Products.js"
const Cart = require('../models/Cart');

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
    if (!['card', 'cash'].includes(paymentMethod)) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ message: 'paymentMethod must be card or cash' });
    }

    // Bring cart with product docs
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product')
      .session(session);

    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock first
    for (const it of cart.items) {
      const prodDoc = it.product; // populated
      const qty = Number(it.quantity ?? it.qty ?? 1);
      if (!prodDoc?._id) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ message: 'Invalid cart item (missing product)' });
      }
      if (Number(prodDoc.prodStock) < qty) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ message: `Insufficient stock for ${prodDoc.prodName}` });
      }
    }

    // Build order items + total
    const items = cart.items.map((it) => {
      const qty = Number(it.quantity ?? it.qty ?? 1);
      const priceAtTime = Number(it.product?.prodPrice ?? it.priceAtTime ?? 0);
      return { product: it.product._id, quantity: qty, priceAtTime };
    });
    const total = items.reduce((s, x) => s + x.priceAtTime * x.quantity, 0);

    // Create order
    const [order] = await Orders.create(
      [
        {
          user: userId,
          items,
          total,
          shippingAddress, // String (per Orders schema)
          paymentMethod,   // 'card' | 'cash'
          status: 'pending',
        },
      ],
      { session }
    );

    // Decrement stock atomically for each item
    for (const it of items) {
      const upd = await Products.updateOne(
        { _id: it.product, prodStock: { $gte: it.quantity } },
        { $inc: { prodStock: -it.quantity } }
      ).session(session);

      if (upd.matchedCount === 0 || upd.modifiedCount === 0) {
        await session.abortTransaction(); session.endSession();
        return res
          .status(409)
          .json({ message: 'Stock changed while ordering. Please refresh your cart.' });
      }
    }

    // Clear cart
    await Cart.deleteOne({ user: userId }).session(session);

    await session.commitTransaction();
    session.endSession();

    const full = await Orders.findById(order._id).populate('items.product');
    return res.status(201).json({ message: 'Order placed successfully', order: full });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('PlaceOrder error:', err);
    return res
      .status(500)
      .json({ message: 'Server error placing order', error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Orders.find({ user: req.user._id })
      .populate('items.product')
      .populate('user');

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Server error fetching orders", error: err.message });
  }
};

// في orderController.js
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Orders.find()
      .populate('items.product')
      .populate('user');

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
};
