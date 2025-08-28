#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Pwani Love Dating App Setup');
console.log('================================\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 16) {
    log('❌ Node.js version 16 or higher is required', 'red');
    log(`Current version: ${nodeVersion}`, 'yellow');
    process.exit(1);
  }
  
  log(`✅ Node.js version: ${nodeVersion}`, 'green');
}

function checkNpm() {
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log(`✅ npm version: ${npmVersion}`, 'green');
  } catch (error) {
    log('❌ npm is not installed', 'red');
    process.exit(1);
  }
}

function checkExpo() {
  try {
    const expoVersion = execSync('expo --version', { encoding: 'utf8' }).trim();
    log(`✅ Expo CLI version: ${expoVersion}`, 'green');
  } catch (error) {
    log('⚠️  Expo CLI not found. Installing...', 'yellow');
    try {
      execSync('npm install -g @expo/cli', { stdio: 'inherit' });
      log('✅ Expo CLI installed successfully', 'green');
    } catch (installError) {
      log('❌ Failed to install Expo CLI', 'red');
      log('Please install manually: npm install -g @expo/cli', 'yellow');
    }
  }
}

function installDependencies() {
  log('\n📦 Installing backend dependencies...', 'blue');
  try {
    execSync('npm install', { stdio: 'inherit' });
    log('✅ Backend dependencies installed', 'green');
  } catch (error) {
    log('❌ Failed to install backend dependencies', 'red');
    process.exit(1);
  }

  log('\n📦 Installing frontend dependencies...', 'blue');
  try {
    execSync('cd client && npm install', { stdio: 'inherit' });
    log('✅ Frontend dependencies installed', 'green');
  } catch (error) {
    log('❌ Failed to install frontend dependencies', 'red');
    process.exit(1);
  }
}

function createEnvFiles() {
  log('\n🔧 Creating environment files...', 'blue');
  
  // Backend .env
  const backendEnvContent = `# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Database Configuration (if using PostgreSQL/MongoDB)
DATABASE_URL=your-database-connection-string

# Socket.IO Configuration
SOCKET_CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=10485760
MAX_FILES_PER_UPLOAD=5

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password

# Push Notifications
FCM_SERVER_KEY=your-fcm-server-key
`;

  // Frontend .env
  const frontendEnvContent = `# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Cloudinary
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
`;

  try {
    fs.writeFileSync('.env', backendEnvContent);
    log('✅ Backend .env file created', 'green');
  } catch (error) {
    log('❌ Failed to create backend .env file', 'red');
  }

  try {
    fs.writeFileSync('client/.env', frontendEnvContent);
    log('✅ Frontend .env file created', 'green');
  } catch (error) {
    log('❌ Failed to create frontend .env file', 'red');
  }
}

function createDirectories() {
  log('\n📁 Creating necessary directories...', 'blue');
  
  const directories = [
    'client/src/components',
    'client/src/screens/auth',
    'client/src/screens/main',
    'client/src/context',
    'client/src/theme',
    'client/src/utils',
    'client/src/assets/fonts',
    'client/src/assets/images',
  ];

  directories.forEach(dir => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        log(`✅ Created directory: ${dir}`, 'green');
      }
    } catch (error) {
      log(`❌ Failed to create directory: ${dir}`, 'red');
    }
  });
}

function showNextSteps() {
  log('\n🎉 Setup completed successfully!', 'green');
  log('\n📋 Next steps:', 'blue');
  log('1. Configure your environment variables in .env files', 'yellow');
  log('2. Set up Firebase project and update credentials', 'yellow');
  log('3. Set up Cloudinary account and update credentials', 'yellow');
  log('4. Get Google Maps API key and update credentials', 'yellow');
  log('5. Start the backend server: npm run dev', 'yellow');
  log('6. Start the frontend: cd client && npm start', 'yellow');
  
  log('\n📚 Documentation:', 'blue');
  log('• README.md - Complete setup and usage guide', 'yellow');
  log('• API documentation in README.md', 'yellow');
  
  log('\n🔗 Useful links:', 'blue');
  log('• Firebase Console: https://console.firebase.google.com', 'yellow');
  log('• Cloudinary Dashboard: https://cloudinary.com/console', 'yellow');
  log('• Google Cloud Console: https://console.cloud.google.com', 'yellow');
  log('• Expo Documentation: https://docs.expo.dev', 'yellow');
  
  log('\n💡 Tips:', 'blue');
  log('• Make sure to change the JWT_SECRET in production', 'yellow');
  log('• Enable location permissions in your device/simulator', 'yellow');
  log('• Test the app on both iOS and Android', 'yellow');
  
  log('\n🚀 Happy coding!', 'green');
}

function main() {
  try {
    log('Checking prerequisites...', 'blue');
    checkNodeVersion();
    checkNpm();
    checkExpo();
    
    log('\nInstalling dependencies...', 'blue');
    installDependencies();
    
    log('\nSetting up project structure...', 'blue');
    createDirectories();
    createEnvFiles();
    
    showNextSteps();
    
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run setup
main();
