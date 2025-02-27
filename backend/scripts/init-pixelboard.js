require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('../models/settings');

// Default pixel board settings
const defaultSettings = {
  key: 'pixelBoardSettings',
  value: {
    rateLimit: 60, // 60 seconds between pixel placements
    boardSize: 100, // 100x100 grid
    enabled: true
  }
};

const initializePixelBoard = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Create or update pixel board settings
    const settings = await Settings.findOneAndUpdate(
      { key: 'pixelBoardSettings' },
      defaultSettings,
      { upsert: true, new: true }
    );

    console.log('Pixel board settings initialized:', settings);

    // Create indexes for better performance
    const Pixel = require('../models/pixel');
    const PixelHistory = require('../models/pixelHistory');

    await Promise.all([
      // Ensure indexes are created
      Pixel.init(),
      PixelHistory.init()
    ]);

    console.log('Database indexes created successfully');

  } catch (error) {
    console.error('Error initializing pixel board:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the initialization
initializePixelBoard();
