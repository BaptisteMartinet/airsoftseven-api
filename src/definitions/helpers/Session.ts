import type { IdType } from '@sequelize-graphql/core';

import * as jwt from 'jsonwebtoken';
import { differenceInSeconds } from 'date-fns';
import { Session } from '@definitions/models';
import { JWT_SECRET_KEY } from '@constants/env';

export async function createSession(userId: IdType, opts: { now: Date; expireAt: Date }) {
  const { now, expireAt } = opts;
  const session = await Session.model.create({
    token: '', // Will be filled
    refreshToken: '', // Will be filled
    expireAt,
    userId,
  });
  const token = jwt.sign(session.id, JWT_SECRET_KEY, { expiresIn: '5m' });
  const expiresIn = differenceInSeconds(now, expireAt);
  const refreshToken = jwt.sign(session.id, JWT_SECRET_KEY, { expiresIn });
  return session.update({ token, refreshToken });
}

export function makeEmailVerificationToken(userId: IdType) {
  return jwt.sign({ userId, type: 'emailVerification' }, JWT_SECRET_KEY, { expiresIn: '10m' });
}

export function ensureEmailVerificationTokenPayload(token: string) {
  const payload = jwt.verify(token, JWT_SECRET_KEY);
  if (typeof payload === 'string') throw new Error('Invalid payload type');
  const { userId } = payload;
  if (!userId) throw new Error('Invalid payload userId');
  return userId as IdType;
}
