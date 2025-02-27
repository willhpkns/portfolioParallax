const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

// Add init method for model initialization
Settings.init = async function() {
  try {
    // Drop existing index if it exists
    await mongoose.connection.collection('settings').dropIndexes();
    // Create new index
    await this.createIndexes();
    return this;
  } catch (error) {
    console.error('Failed to initialize Settings model:', error);
    throw error;
  }
};

module.exports = Settings;
