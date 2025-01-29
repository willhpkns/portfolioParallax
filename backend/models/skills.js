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
  items: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Skills', skillsSchema);
