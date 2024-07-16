import type { IdType } from '@sequelize-graphql/core';

import { differenceInSeconds } from 'date-fns';
import { signJWT, verifyJWT } from '@utils/jwt';
import { Session } from '@definitions/models';

export async function createSession(userId: IdType, opts: { now: Date; expireAt: Date }) {
  const { now, expireAt } = opts;
  const session = await Session.model.create({
    token: '', // Will be filled
    refreshToken: '', // Will be filled
    expireAt,
    userId,
  });
  const token = signJWT({ sessionId: session.id }, { expiresIn: '5m' });
  const expiresIn = differenceInSeconds(expireAt, now);
  const refreshToken = signJWT({ sessionId: session.id }, { expiresIn });
  return session.update({ token, refreshToken });
}

export function makeEmailVerificationToken(userId: IdType) {
  return signJWT({ userId, type: 'emailVerification' }, { expiresIn: '10m' });
}

export function ensureEmailVerificationTokenPayload(token: string) {
  const payload = verifyJWT(token);
  const { userId, type } = payload;
  if (!userId || type !== 'emailVerification') throw new Error('Invalid verification payload');
  return userId as IdType;
}
