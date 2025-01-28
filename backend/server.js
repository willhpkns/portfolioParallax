require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  console.log('MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio');
  // Check database connection state
  const dbState = mongoose.connection.readyState;
  console.log('Database connection state:', dbState, '(0: disconnected, 1: connected, 2: connecting, 3: disconnecting)');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  // Log more details about the error
  if (err.name === 'MongoServerError') {
    console.error('MongoDB Server Error Details:', {
      code: err.code,
      codeName: err.codeName,
      errorLabels: err.errorLabels,
    });
  }
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
