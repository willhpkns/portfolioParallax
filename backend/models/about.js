const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "Your Name"
  },
  position: {
    type: String,
    required: true,
    default: "Your Position"
  },
  description: {
    type: [String],
    required: true,
    default: []
  },
  profileImage: {
    type: String,
    required: true,
    default: "https://plus.unsplash.com/premium_vector-1730832937938-74637e0bd0c5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
  }
}, {
  timestamps: true // Add timestamps for tracking creation and updates
});

module.exports = mongoose.model('About', aboutSchema);
