const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Delete any existing admin user
    await Admin.deleteOne({ username: process.env.ADMIN_USERNAME || 'admin' });

    // Create fresh admin user
    await Admin.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123'  // Will be hashed by the pre-save hook
    });
    console.log('Admin user reset successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
  }
};

// Run the script
createAdminUser();
