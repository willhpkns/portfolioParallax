const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Settings = require('../models/settings');
const Pixel = require('../models/pixel');
const PixelHistory = require('../models/pixelHistory');
const { auth, isAdmin } = require('../middleware/auth');

// Debug logging for route initialization
console.log('Initializing pixel routes...');

// Public routes
// GET /api/pixels - Get current board state
router.get('/', async function(req, res) {
  console.log('GET /api/pixels called');
  try {
    const pixels = await Pixel.find({});
    res.json(pixels);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving pixels', error: err.message });
  }
});

// POST /api/pixels - Update a pixel (open to everyone except in maintenance mode)
router.post('/', async function(req, res) {
  console.log('POST /api/pixels called with body:', req.body);
  const { x, y, color } = req.body;
  const ipAddress = req.ip;

  try {
    // Get settings
    const settings = await Settings.findOne({ key: 'pixelBoardSettings' });
    const rateLimit = settings?.value?.rateLimit || 60; // Default 60 seconds
    const boardSize = settings?.value?.boardSize || 100; // Default 100x100
    const enabled = settings?.value?.enabled ?? true;
    const maintenanceMessage = settings?.value?.maintenanceMessage;

    // Check if board is in maintenance mode
    if (!enabled) {
      return res.status(503).json({ 
        message: maintenanceMessage || 'Pixel Board is currently in maintenance mode.'
      });
    }

    // Validate coordinates
    if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }

    // Check rate limit
    const lastUpdate = await PixelHistory.findOne({ 
      ipAddress,
      createdAt: { $gt: new Date(Date.now() - rateLimit * 1000) }
    });

    if (lastUpdate) {
      const timeLeft = Math.ceil((lastUpdate.createdAt.getTime() + rateLimit * 1000 - Date.now()) / 1000);
      return res.status(429).json({ 
        message: 'Rate limit exceeded',
        timeLeft
      });
    }

    try {
      // Update or create pixel
      await Pixel.findOneAndUpdate(
        { x, y },
        { color },
        { upsert: true, new: true }
      );

      // Create history entry
      await PixelHistory.create({
        x,
        y,
        color,
        ipAddress,
        userId: req.user?._id
      });

      res.json({ message: 'Pixel updated successfully' });
    } catch (err) {
      console.error('Error updating pixel:', err);
      res.status(500).json({ message: 'Error updating pixel', error: err.message });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating pixel', error: err.message });
  }
});

// Admin-only routes
// GET /api/pixels/history - Get pixel history
router.get('/history', isAdmin, async function(req, res) {
  const { page = 1, limit = 100, startDate, endDate } = req.query;
  
  try {
    const query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [history, total] = await Promise.all([
      PixelHistory.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      PixelHistory.countDocuments(query)
    ]);

    res.json({
      history,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving history', error: err.message });
  }
});

// GET /api/pixels/history/timelapse - Get ordered history for timelapse
router.get('/history/timelapse', isAdmin, async function(req, res) {
  try {
    // Get limited recent history for timelapse (last 1000 pixels to avoid performance issues)
    const limit = parseInt(req.query.limit) || 1000;
    const history = await PixelHistory.find()
      .sort({ createdAt: -1 }) // Get most recent first
      .limit(limit)
      .select('x y color createdAt')
      .lean();

    // Reverse to get chronological order
    history.reverse();

    // Calculate progressive states - but only store key snapshots to reduce payload
    const states = [];
    const currentState = new Map();
    const snapshotInterval = Math.max(1, Math.floor(history.length / 100)); // Take ~100 snapshots max

    history.forEach((pixel, index) => {
      // Update current state with new pixel
      const key = `${pixel.x},${pixel.y}`;
      currentState.set(key, {
        x: pixel.x,
        y: pixel.y,
        color: pixel.color
      });

      // Only create snapshots at intervals or for the last pixel
      if (index % snapshotInterval === 0 || index === history.length - 1) {
        states.push({
          pixel: {
            x: pixel.x,
            y: pixel.y,
            color: pixel.color
          },
          timestamp: pixel.createdAt,
          fullState: Array.from(currentState.values())
        });
      }
    });

    res.json({
      totalPixels: history.length,
      states: states,
      isLimited: history.length === limit
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving board state', error: err.message });
  }
});

// GET /api/pixels/stats - Get statistics
router.get('/stats', isAdmin, async function(req, res) {
  try {
    const [
      totalPixels,
      mostActiveHours,
      colorStats
    ] = await Promise.all([
      PixelHistory.countDocuments(),
      PixelHistory.aggregate([
        {
          $group: {
            _id: { 
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
              hour: { $hour: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 24 }
      ]),
      PixelHistory.aggregate([
        {
          $group: {
            _id: '$color',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      totalPixels,
      mostActiveHours,
      colorStats
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving statistics', error: err.message });
  }
});

// GET /api/pixels/public-settings - Get public settings (no auth required)
router.get('/public-settings', async function(req, res) {
  try {
    const settings = await Settings.findOne({ key: 'pixelBoardSettings' });
    // Only return public settings
    res.json({
      rateLimit: settings?.value?.rateLimit || 60,
      boardSize: settings?.value?.boardSize || 100
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving settings', error: err.message });
  }
});

// GET /api/pixels/settings - Get all settings (admin only)
router.get('/settings', isAdmin, async function(req, res) {
  try {
    const settings = await Settings.findOne({ key: 'pixelBoardSettings' });
    // Return all settings including admin-only ones
    res.json(settings?.value || {
      rateLimit: 60,
      boardSize: 100,
      enabled: true
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving settings', error: err.message });
  }
});

// POST /api/pixels/settings - Update settings with maintenance message
router.put('/settings', isAdmin, async function(req, res) {
const { rateLimit, enabled, maintenanceMessage } = req.body;

  try {
    const settings = await Settings.findOneAndUpdate(
      { key: 'pixelBoardSettings' },
      { 
        $set: { 
          value: {
            rateLimit: parseInt(rateLimit),
            boardSize: 100, // Fixed size
            enabled: Boolean(enabled),
            maintenanceMessage: maintenanceMessage || "Pixel Board is currently in maintenance mode. Please try again later."
          }
        }
      },
      { upsert: true, new: true }
    );

    res.json(settings.value);
  } catch (err) {
    res.status(500).json({ message: 'Error updating settings', error: err.message });
  }
});

// Debug: Log all registered routes in this router
console.log('Pixel Routes registered:');
router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods)} ${r.route.path}`);
  }
});

module.exports = router;
