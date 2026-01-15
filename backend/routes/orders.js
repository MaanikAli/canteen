import express from 'express';
import Order from '../models/Order.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import mongoose from 'mongoose';

// Function to generate a 5-digit OTP
const generateOTP = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

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
    // Fetch user to get name
    const User = (await import('../models/User.js')).default;
    const MenuItem = (await import('../models/MenuItem.js')).default;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check stock availability and update stock
    for (const item of req.body.items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item ${item.name} not found` });
      }
      if (menuItem.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}. Available: ${menuItem.stockQuantity}, Requested: ${item.quantity}` });
      }
    }

    // Deduct stock quantities
    for (const item of req.body.items) {
      await MenuItem.findByIdAndUpdate(
        item.menuItemId,
        { $inc: { stockQuantity: -item.quantity } }
      );
    }

    const orderData = {
      ...req.body,
      userId: req.user.userId,
      userName: user.name
    };
    const order = new Order(orderData);
    await order.save();

    // Emit real-time update for new order
    const io = req.app.get('io');
    if (io) {
      io.emit('newOrder', {
        orderId: order._id,
        userId: order.userId,
        userName: order.userName,
        status: order.status,
        items: order.items,
        totalPrice: order.totalPrice
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (admin/kitchen only)
router.put('/:id/status', authenticateToken, requireRole(['admin', 'kitchen']), async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };

    // Generate OTP if status is changing to 'Ready for Pickup'
    if (status === 'Ready for Pickup') {
      updateData.otp = generateOTP();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('orderStatusUpdate', {
        orderId: order._id,
        status: order.status,
        userId: order.userId,
        userName: order.userName,
        otp: order.otp
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete order (admin or order owner for completed orders)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions: admin can delete any order, users can only delete their own completed orders
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own orders' });
    }

    // Only allow deletion of completed orders for non-admin users
    if (req.user.role !== 'admin' && order.status !== 'Completed') {
      return res.status(400).json({ message: 'Only completed orders can be deleted' });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate OTP for user's order (users can generate/regenerate OTP for their 'Ready for Pickup' orders)
router.post('/:id/generate-otp', authenticateToken, ensureConnection, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only generate OTP for your own orders' });
    }

    // Check if order is in 'Ready for Pickup' status
    if (order.status !== 'Ready for Pickup') {
      return res.status(400).json({ message: 'OTP can only be generated for orders ready for pickup' });
    }

    // Generate new OTP
    const newOTP = generateOTP();
    order.otp = newOTP;
    await order.save();

    res.json({ message: 'OTP generated successfully', otp: newOTP });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify OTP and complete order (kitchen staff only)
router.post('/:id/verify-otp', authenticateToken, requireRole(['admin', 'kitchen']), async (req, res) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is in 'Ready for Pickup' status
    if (order.status !== 'Ready for Pickup') {
      return res.status(400).json({ message: 'Order is not ready for pickup' });
    }

    // Verify OTP
    if (order.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Update order status to 'Completed'
    order.status = 'Completed';
    await order.save();

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('orderStatusUpdate', {
        orderId: order._id,
        status: order.status,
        userId: order.userId,
        userName: order.userName
      });
    }

    res.json({ message: 'Order completed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
