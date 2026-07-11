const fs = require('fs');
const b = fs.readFileSync('package.json');
console.log('First 6 bytes hex:', b.slice(0, 6).toString('hex'));
try {
  const parsed = JSON.parse(b.toString('utf8'));
  console.log('Parsed version:', parsed.version);
  console.log('JSON is valid');
} catch(e) {
  console.log('JSON parse error:', e.message);
}
