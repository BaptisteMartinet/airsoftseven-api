import type { SignOptions } from 'jsonwebtoken';

import * as jwt from 'jsonwebtoken';
import { __JWT_SECRET_KEY__ } from '@constants/env';

export function signJWT(payload: Record<string, any>, opts: SignOptions) {
  return jwt.sign(payload, __JWT_SECRET_KEY__, opts);
}

export function verifyJWT(token: string) {
  const payload = jwt.verify(token, __JWT_SECRET_KEY__); // TODO verify options?
  if (typeof payload === 'string') throw new Error('Invalid JWT payload');
  return payload;
}
