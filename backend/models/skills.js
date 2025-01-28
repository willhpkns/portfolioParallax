const mongoose = require('mongoose');

const skillsSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true,
    default: 0
  },
  category: {
    type: String,
    required: true
  },
  items: {
    type: [String],
    required: true,
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Skills', skillsSchema);
