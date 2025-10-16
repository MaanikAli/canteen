import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import userRoutes from './routes/users.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection with caching for serverless environments
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sowad:sowad@cluster0.m7vh241.mongodb.net/greenCanteenDb?retryWrites=true&w=majority&appName=Cluster0';

mongoose.set('strictQuery', false);

// Global connection cache for serverless environments
let cachedConnection = null;

async function connectToDatabase() {
  // Return cached connection if it exists and is still connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      dbName: 'greenCanteenDb',
      maxPoolSize: 10, // Maximum number of connections in the connection pool
      serverSelectionTimeoutMS: 5000, // How long to wait for server selection
      socketTimeoutMS: 45000, // How long to wait for socket operations
      bufferCommands: false, // Disable mongoose buffering
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    });

    cachedConnection = connection;
    console.log('Connected to MongoDB database: greenCanteenDb');
    console.log('Current database name:', mongoose.connection.db.databaseName);
    return connection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    cachedConnection = null; // Reset cache on error
    throw err;
  }
}

// Initialize connection (for traditional server) or handle serverless
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  // For Vercel/serverless, connection will be established on first request
  console.log('Running in serverless environment, connection will be established on first request');
} else {
  // For local development, establish connection immediately
  connectToDatabase();
}

// Routes
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Database name check
app.get('/api/dbname', (req, res) => {
  res.json({ databaseName: mongoose.connection.db.databaseName });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
