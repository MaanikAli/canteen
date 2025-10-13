import express from 'express';
import MenuItem from '../models/MenuItem.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Middleware to ensure database connection for serverless environments
const ensureConnection = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      // For serverless environments, establish connection if needed
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
    console.error('Database connection error in menu route:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
};

// Get all menu items
router.get('/', ensureConnection, async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get menu item by ID
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new menu item (admin only)
// Temporarily disabled authentication for testing
// router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
router.post('/', async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update menu item (admin only)
// Temporarily disabled authentication for testing
// router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
router.put('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete menu item (admin only)
// Temporarily disabled authentication for testing
// router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
router.delete('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
