const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true,
    default: 0
  },
  institution: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  field: {
    type: String,
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Education', educationSchema);
