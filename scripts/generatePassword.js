const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Generate JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET=' + jwtSecret);

// Generate password hash
const password = process.argv[2] || 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log('ADMIN_PASSWORD_HASH=' + hash);
console.log('\nPassword used:', password);