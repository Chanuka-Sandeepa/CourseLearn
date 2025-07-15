// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/Course');
const enrollmentRoutes = require('./routes/enrollment');
const chatGptRoutes = require('./routes/chatgpt');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection with correct options
const connectToAtlas = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      // Removed unsupported options: bufferMaxEntries, retryWrites, w
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
    console.error('🔍 Connection string being used:', process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@'));
    
    // Retry connection after 5 seconds
    console.log('🔄 Retrying Atlas connection in 5 seconds...');
    setTimeout(connectToAtlas, 5000);
  }
};

// MongoDB connection event listeners
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Atlas error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB Atlas');
  console.log('🔄 Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ Mongoose reconnected to MongoDB Atlas');
});

// Connect to MongoDB Atlas
connectToAtlas();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/chatgpt', chatGptRoutes);

// Health Check with Atlas status
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    status: 'Server is running',
    database: statusMap[dbStatus] || 'unknown',
    atlas_connection: dbStatus === 1 ? 'active' : 'inactive',
    timestamp: new Date().toISOString() 
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err,
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
