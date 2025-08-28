const fs = require('fs');
const path = require('path');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy index.html to dist
const sourceFile = path.join(__dirname, 'index.html');
const destFile = path.join(distDir, 'index.html');

try {
    fs.copyFileSync(sourceFile, destFile);
    console.log('✅ Build successful! index.html copied to dist/');
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}
