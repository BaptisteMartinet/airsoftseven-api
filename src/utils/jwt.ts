import type { SignOptions } from 'jsonwebtoken';

import * as jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '@constants/env';

export function signJWT(payload: Record<string, any>, opts: SignOptions) {
  return jwt.sign(payload, JWT_SECRET_KEY, opts);
}

export function verifyJWT(token: string) {
  const payload = jwt.verify(token, JWT_SECRET_KEY); // TODO verify options?
  if (typeof payload === 'string') throw new Error('Invalid JWT payload');
  return payload;
}
