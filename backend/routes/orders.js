import express from 'express';
import Order from '../models/Order.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all orders (authenticated users can see their own, admin/kitchen can see all)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin' || req.user.role === 'kitchen') {
      orders = await Order.find().sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order by ID (admin/kitchen only)
router.get('/:id', authenticateToken, requireRole(['admin', 'kitchen']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new order (all authenticated users including admin and kitchen)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      userId: req.user.userId,
      userName: req.user.name
    };
    const order = new Order(orderData);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (admin/kitchen only)
router.put('/:id/status', authenticateToken, requireRole(['admin', 'kitchen']), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
