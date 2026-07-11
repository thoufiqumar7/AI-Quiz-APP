const fs = require('fs');
const path = require('path');

// Find and report the accepts package version
try {
  const pkg = require('./node_modules/accepts/package.json');
  console.log('accepts version:', JSON.stringify(pkg.version));
} catch(e) {
  console.log('accepts not found:', e.message);
}
