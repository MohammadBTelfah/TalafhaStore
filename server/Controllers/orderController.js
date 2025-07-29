const Orders = require('../models/Orders');
const Cart = require('../models/Cart');

exports.PlaceOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Shipping address and payment method are required' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      priceAtTime: item.product.prodPrice
    }));

    const total = items.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);

    const order = new Orders({
      user: req.user._id,
      items,
      total,
      shippingAddress,
      paymentMethod,
      status: 'pending'
    });

    await order.save();

    const populatedOrder = await Orders.findById(order._id).populate('items.product');

    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: 'Server error placing order', error: error.message });
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
