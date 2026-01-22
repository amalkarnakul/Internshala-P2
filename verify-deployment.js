// Deployment Verification Script
// This script can be used to verify the Storybook deployment

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Storybook Build...');

// Check if storybook-static directory exists
const storybookDir = path.join(__dirname, 'storybook-static');
if (!fs.existsSync(storybookDir)) {
  console.error('❌ storybook-static directory not found!');
  console.log('💡 Run: npm run build-storybook');
  process.exit(1);
}

// Check if index.html exists
const indexPath = path.join(storybookDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found in storybook-static!');
  process.exit(1);
}

// Check if assets directory exists
const assetsDir = path.join(storybookDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  console.error('❌ assets directory not found!');
  process.exit(1);
}

// Count files in storybook-static
const files = fs.readdirSync(storybookDir);
console.log(`✅ Found ${files.length} files in storybook-static/`);

// Check for key files
const keyFiles = ['index.html', 'iframe.html'];
const missingFiles = keyFiles.filter(file => !files.includes(file));

if (missingFiles.length > 0) {
  console.error(`❌ Missing key files: ${missingFiles.join(', ')}`);
  process.exit(1);
}

console.log('✅ All verification checks passed!');
console.log('🚀 Ready for Vercel deployment!');
console.log('');
console.log('📋 Next Steps:');
console.log('1. Go to https://vercel.com/dashboard');
console.log('2. Click "New Project"');
console.log('3. Import: https://github.com/amalkarnakul/Internshala-P2');
console.log('4. Set Build Command: npm run build-storybook');
console.log('5. Set Output Directory: storybook-static');
console.log('6. Deploy! 🎉');