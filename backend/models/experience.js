const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true,
    default: 0
  },
  company: {
    type: String,
    required: true
  },
  position: {
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
  },
  technologies: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Experience', experienceSchema);
