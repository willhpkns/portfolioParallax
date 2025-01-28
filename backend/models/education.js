const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
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
