const mongoose = require('mongoose');

const pixelHistorySchema = new mongoose.Schema({
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, { timestamps: true });

// Create indexes for common queries
pixelHistorySchema.index({ x: 1, y: 1 });
pixelHistorySchema.index({ createdAt: -1 });
pixelHistorySchema.index({ ipAddress: 1, createdAt: -1 });

const PixelHistory = mongoose.model('PixelHistory', pixelHistorySchema);

// Add init method for model initialization
PixelHistory.init = async function() {
  await this.createIndexes();
  return this;
};

module.exports = PixelHistory;
