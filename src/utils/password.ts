import { randomBytes, scryptSync } from 'crypto';

function encryptPassword(password: string, salt: string) {
  return scryptSync(password, salt, 32).toString('hex');
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return encryptPassword(password, salt) + salt;
}

export function comparePassword(password: string, hash: string) {
  const salt = hash.slice(64);
  const originalPasswordHash = hash.slice(0, 64);
  const currentPasswordHash = encryptPassword(password, salt);
  return currentPasswordHash === originalPasswordHash;
}
