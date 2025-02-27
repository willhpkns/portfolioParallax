const mongoose = require('mongoose');
const Admin = require('../models/admin');
require('dotenv').config();

const createAdminUser = async () => {
  let connection;
  try {
    console.log('Connecting to MongoDB...');
    connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // Drop the admin collection to ensure clean slate
    console.log('Dropping admin collection...');
    await connection.connection.collection('admins').drop().catch(err => {
      if (err.code === 26) {
        console.log('Admin collection does not exist, proceeding...');
      } else {
        throw err;
      }
    });

    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin';

    console.log(`Creating new admin user with username: ${username}`);
    const admin = await Admin.create({
      username: username,
      password: password,  // Will be hashed by the pre-save hook
      isAdmin: true  // Set admin flag
    });

    // Verify the admin was created
    const verifyAdmin = await Admin.findById(admin._id);
    if (!verifyAdmin) {
      throw new Error('Failed to verify admin creation');
    }

    console.log('Admin user created successfully with ID:', admin._id);
    console.log('You can now log in with:');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error('Error during admin user creation:', error);
    process.exit(1);
  } finally {
    if (connection) {
      console.log('Closing MongoDB connection...');
      await connection.connection.close();
      console.log('MongoDB connection closed');
    }
  }
};

// Run the script
console.log('Starting admin user initialization...');
createAdminUser().then(() => {
  console.log('Admin initialization completed');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
