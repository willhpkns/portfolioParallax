const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },
  location: {
    country: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  userAgent: {
    browser: String,
    version: String,
    os: String,
    platform: String,
    isMobile: Boolean
  },
  page: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    default: 0
  },
  referrer: String
});

// Add indexes for common queries
visitorSchema.index({ timestamp: -1 });
visitorSchema.index({ ip: 1, timestamp: -1 });

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;
