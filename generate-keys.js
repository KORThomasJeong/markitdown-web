const crypto = require('crypto');

// JWT 시크릿 키 생성 (64바이트 랜덤 문자열을 16진수로 변환)
const jwtSecret = crypto.randomBytes(32).toString('hex');

// API 키 생성 (32바이트 랜덤 문자열을 base64로 변환)
const apiKey = crypto.randomBytes(32).toString('base64');

console.log('새로운 JWT 시크릿 키:', jwtSecret);
console.log('새로운 API 키:', apiKey);
