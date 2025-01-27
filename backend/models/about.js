const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  description: {
    type: [String],
    required: true,
    default: []
  }
}, {
  timestamps: true // Add timestamps for tracking creation and updates
});

module.exports = mongoose.model('About', aboutSchema);
