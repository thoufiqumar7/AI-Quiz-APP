const fs = require('fs');
const lockPath = './package-lock.json';

if (!fs.existsSync(lockPath)) {
  console.log('No package-lock.json found');
  process.exit(0);
}

const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
const packages = lock.packages || {};
let found = false;

for (const [name, pkg] of Object.entries(packages)) {
  if (pkg.version === '' || pkg.version === undefined || pkg.version === null) {
    console.log('EMPTY VERSION in:', name, JSON.stringify(pkg.version));
    found = true;
  }
}

if (!found) {
  console.log('No empty versions found in package-lock.json');
}
