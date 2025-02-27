const mongoose = require('mongoose');

const pixelSchema = new mongoose.Schema({
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
}, { timestamps: true });

// Create compound index for x and y coordinates
pixelSchema.index({ x: 1, y: 1 }, { unique: true });

const Pixel = mongoose.model('Pixel', pixelSchema);

// Add init method for model initialization
Pixel.init = async function() {
  await this.createIndexes();
  return this;
};

module.exports = Pixel;
