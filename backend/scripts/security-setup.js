#!/usr/bin/env node

/**
 * Security Setup Script for Portfolio VPS Deployment
 * 
 * This script generates secure JWT secrets and provides setup instructions
 * for production deployment on your VPS.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 Portfolio Security Setup for VPS Deployment\n');

// Generate secure secrets
const jwtSecret = crypto.randomBytes(64).toString('hex');
const refreshSecret = crypto.randomBytes(64).toString('hex');

console.log('Generated secure secrets:');
console.log('========================');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${refreshSecret}\n`);

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

console.log('📝 Environment Configuration:');
console.log('============================');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  console.log('⚠️  Please update your .env file with the new secrets above');
} else {
  console.log('❌ .env file not found');
  console.log('📋 Creating .env file from .env.example...');
  
  try {
    if (fs.existsSync(envExamplePath)) {
      let envContent = fs.readFileSync(envExamplePath, 'utf8');
      
      // Replace placeholder secrets
      envContent = envContent.replace(
        'JWT_SECRET=your_super_secure_jwt_secret_here_minimum_32_characters',
        `JWT_SECRET=${jwtSecret}`
      );
      envContent = envContent.replace(
        'JWT_REFRESH_SECRET=your_even_more_secure_refresh_secret_here_minimum_32_characters',
        `JWT_REFRESH_SECRET=${refreshSecret}`
      );
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env file created with secure secrets');
    } else {
      console.log('❌ .env.example file not found');
    }
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }
}

console.log('\n🚀 VPS Deployment Checklist:');
console.log('===========================');
console.log('1. ✅ Update your VPS .env file with the secrets above');
console.log('2. ✅ Ensure MongoDB is running with authentication');
console.log('3. ✅ Update MONGODB_URI with your actual credentials');
console.log('4. ✅ Set NODE_ENV=production');
console.log('5. ✅ Verify ALLOWED_ORIGINS includes your domain');
console.log('6. ✅ Install helmet package: npm install helmet');
console.log('7. ✅ Restart your application containers');

console.log('\n🔧 VPS Commands to run:');
console.log('======================');
console.log('# On your VPS, update the .env file:');
console.log('sudo nano /path/to/your/app/.env');
console.log('');
console.log('# Add these environment variables:');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);
console.log('NODE_ENV=production');
console.log('');
console.log('# Restart your Docker containers:');
console.log('docker-compose down && docker-compose up -d');

console.log('\n🛡️  Security Features Enabled:');
console.log('==============================');
console.log('✅ Helmet security headers');
console.log('✅ Enhanced rate limiting');
console.log('✅ JWT access + refresh tokens');
console.log('✅ Automatic token refresh');
console.log('✅ IP-based login attempt tracking');
console.log('✅ CORS protection');
console.log('✅ Request size limits');
console.log('✅ Input validation');

console.log('\n🔗 Next Steps:');
console.log('==============');
console.log('1. Push your code to GitHub (this will trigger deployment)');
console.log('2. SSH to your VPS and update the .env file with the new secrets');
console.log('3. Restart your containers');
console.log('4. Test the admin login at https://willhpkns.soon.it/admin');

console.log('\n✨ All set! Your authentication system is now production-ready!\n');
