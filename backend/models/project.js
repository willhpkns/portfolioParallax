const mongoose = require('mongoose');

// Enable strict mode globally
mongoose.set('strict', true);

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
  timestamps: true,
  strict: true // Enable strict mode for this schema
});

// Add middleware to log technologies array changes
projectSchema.pre('save', function(next) {
  console.log('Pre-save hook - technologies:', this.technologies);
  next();
});

projectSchema.post('save', function(doc) {
  console.log('Post-save hook - saved technologies:', doc.technologies);
});

module.exports = mongoose.model('Project', projectSchema);
