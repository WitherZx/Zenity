const jwt = require('jsonwebtoken');
const fs = require('fs');

// Substitua pelos seus dados:
const privateKey = fs.readFileSync('./AuthKey_WDFQX9QBKK.p8', 'utf8'); // leitura como string
const teamId = 'S3RDH669C7'; // Seu Team ID
const keyId = 'WDFQX9QBKK'; // Seu Key ID
const clientId = 'com.zenity.ios'; // Seu Bundle ID

const token = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d', // até 6 meses
  issuer: teamId,
  audience: 'https://appleid.apple.com',
  subject: clientId,
  keyid: keyId,
});

console.log(token); 