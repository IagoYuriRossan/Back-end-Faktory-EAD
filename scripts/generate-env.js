const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const repoRoot = path.join(__dirname, '..');
const examplePath = path.join(repoRoot, '.env.example');
const outPath = path.join(repoRoot, '.env');

if (!fs.existsSync(examplePath)) {
  console.error('.env.example not found.');
  process.exit(1);
}

if (fs.existsSync(outPath)) {
  console.error('.env already exists. Aborting to avoid overwriting.');
  process.exit(1);
}

let content = fs.readFileSync(examplePath, 'utf8');
const secret = crypto.randomBytes(48).toString('hex');

content = content.replace(/JWT_SECRET\s*=\s*".*"/, `JWT_SECRET="${secret}"`);

fs.writeFileSync(outPath, content, { mode: 0o600 });
console.log('Created .env from .env.example with a generated JWT_SECRET.');
console.log('Do NOT commit the generated .env file.');
