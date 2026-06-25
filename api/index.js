const { execSync } = require('child_process');
const path = require('path');

// Generate Prisma client at runtime if not already generated
try {
  execSync('cd ' + path.join(__dirname, '../backend') + ' && node_modules/.bin/prisma generate', {
    stdio: 'inherit'
  });
} catch (e) {
  console.log('Prisma already generated');
}

const app = require('../backend/server');
module.exports = app;