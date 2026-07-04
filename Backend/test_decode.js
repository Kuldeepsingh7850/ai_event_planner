const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsImlhdCI6MTc4MzE1NTIwMSwiZXhwIjoxNzg1NzQ3MjAxfQ.JKomH4AmoohkILoVDB6IKYiKDScngZJ2FOzg2mCQE0w';

const keys = [
  'kuldeeprajputsecretkey123',
  'supersecretjwttokenforeventplanner2026'
];

keys.forEach(key => {
  try {
    const decoded = jwt.verify(token, key);
    console.log(`Verification SUCCESS with key: "${key}"`);
    console.log('Decoded payload:', decoded);
  } catch (err) {
    console.log(`Verification FAILED with key: "${key}". Error: ${err.message}`);
  }
});
