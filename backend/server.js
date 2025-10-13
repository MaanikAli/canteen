import express from 'express';
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://sowad:sowad@cluster0.m7vh241.mongodb.net/greenCanteenDb?retryWrites=true&w=majority&appName=Cluster0';

mongoose.set('strictQuery', false);

mongoose.connect(mongoUri, { dbName: 'greenCanteenDb' })
  .then(() => {
    console.log('Connected to MongoDB database: greenCanteenDb');
    console.log('Current database name:', mongoose.connection.db.databaseName);
  })
  .catch(err => console.error('MongoDB connection error:', err));

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
