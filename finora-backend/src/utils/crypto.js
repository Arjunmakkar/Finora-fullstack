const crypto = require('crypto');

// Derive 32-byte key from ENCRYPTION_KEY or fallback to JWT_SECRET hash
const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'finora-default-secret-encryption-key-32';
const KEY = crypto.createHash('sha256').update(secret).digest(); // Exactly 32 bytes

const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt plain text using AES-256-GCM.
 * Output format: iv:authTag:encryptedHex
 */
function encrypt(text) {
  if (!text || typeof text !== 'string') return text;
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    // If encryption fails for any reason, return original to avoid breaking writes
    return text;
  }
}

/**
 * Decrypt ciphertext using AES-256-GCM.
 * If input is not in iv:authTag:encryptedHex format, returns text as-is.
 */
function decrypt(ciphertext) {
  if (!ciphertext || typeof ciphertext !== 'string') return ciphertext;
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    // Not encrypted or legacy plaintext
    return ciphertext;
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  if (ivHex.length !== 24 || authTagHex.length !== 32) {
    return ciphertext;
  }

  try {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    // Fallback to ciphertext if decryption fails
    return ciphertext;
  }
}

module.exports = { encrypt, decrypt };
