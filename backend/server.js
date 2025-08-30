require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();

// Basic middleware
console.log('Setting up middleware...');
app.use(cors({
  origin: ['http://localhost:5173', 'https://willhpkns.soon.it'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with retry logic
const connectWithRetry = () => {
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
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  });
};

// Initialize models with retry logic
const initializeModels = async (retries = 3) => {
  try {
    console.log('Initializing models...');
    
    // Initialize models
    await Promise.all([
      require('./models/pixel').init().catch(err => {
        console.warn('Pixel model initialization warning:', err);
        return Promise.resolve();
      }),
      require('./models/pixelHistory').init().catch(err => {
        console.warn('PixelHistory model initialization warning:', err);
        return Promise.resolve();
      }),
      require('./models/settings').init().catch(err => {
        console.warn('Settings model initialization warning:', err);
        return Promise.resolve();
      })
    ]);
    
    console.log('Models initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing models:', error);
    if (retries > 0) {
      console.log(`Retrying model initialization... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return initializeModels(retries - 1);
    }
    return false;
  }
};

// Import and mount routes immediately
console.log('Importing routes...');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const analyticsRoutes = require('./routes/analytics');
const pixelRoutes = require('./routes/pixels');

console.log('Mounting auth routes...');
app.use('/api/auth', authRoutes);
console.log('Auth routes mounted at /api/auth');

console.log('Mounting other routes...');
app.use('/api/content', contentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/pixels', pixelRoutes);
console.log('All routes mounted');

// Debug: Print all registered routes
console.log('\nRegistered Routes:');
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(`${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
  }
});

// Connect to MongoDB and initialize models
console.log('\nInitializing database connection...');
connectWithRetry();

// Initialize models
initializeModels().then(success => {
  if (!success) {
    console.error('Failed to initialize models after retries');
    process.exit(1);
  }
  console.log('Models initialized successfully');
  
  // NOW register the 404 handler - after all routes are ready
  app.use((req, res, next) => {
    console.log('404 handler reached for:', req.method, req.url);
    res.status(404).json({ message: 'Route not found' });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      message: err.message || 'Something went wrong!',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });
});

// Error monitoring for MongoDB connection
mongoose.connection.on('error', err => {
  console.error('MongoDB error after initial connection:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  connectWithRetry();
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle server shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed. Disconnecting from MongoDB...');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

module.exports = app;
