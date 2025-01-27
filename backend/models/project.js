const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  technologies: {
    type: [String],
    required: true,
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
