const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true
  },
  position: {
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

module.exports = mongoose.model('Experience', experienceSchema);
