import express from 'express';
import Order from '../models/Order.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Middleware to ensure database connection for serverless environments
const ensureConnection = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sowad:sowad@cluster0.m7vh241.mongodb.net/greenCanteenDb?retryWrites=true&w=majority&appName=Cluster0';

      await mongoose.connect(mongoUri, {
        dbName: 'greenCanteenDb',
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        bufferMaxEntries: 0,
        maxIdleTimeMS: 30000,
        family: 4,
      });
    }
    next();
  } catch (error) {
    console.error('Database connection error in orders route:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
};

// Get all orders (authenticated users can see their own, admin/kitchen can see all)
router.get('/', authenticateToken, ensureConnection, async (req, res) => {
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
