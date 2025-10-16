import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Settings from '../models/Settings.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(new Error('Only PNG and JPEG images are allowed'));
    }
  }
});

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
    console.error('Database connection error in settings route:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
};

// Get settings
router.get('/', ensureConnection, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update settings (admin only)
router.put('/', authenticateToken, requireRole(['admin']), upload.single('logo'), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const { canteenName } = req.body;

    if (canteenName) {
      settings.canteenName = canteenName;
    }

    if (req.file) {
      // Delete old logo if exists
      if (settings.logoUrl && fs.existsSync(path.join(process.cwd(), settings.logoUrl))) {
        fs.unlinkSync(path.join(process.cwd(), settings.logoUrl));
      }
      settings.logoUrl = `/uploads/${req.file.filename}`;
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Serve uploaded files
router.use('/uploads', express.static(uploadsDir));

export default router;
