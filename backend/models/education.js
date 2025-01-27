const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  school: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  period: {
    type: String,
    required: true
  },
  highlights: {
    type: [String],
    required: true,
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Education', educationSchema);
