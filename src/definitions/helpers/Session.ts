import type { Context } from '@/context';
import type { IdType } from '@sequelize-graphql/core';

import { differenceInSeconds } from 'date-fns';
import { signJWT, verifyJWT } from '@utils/jwt';
import { Session, User } from '@definitions/models';

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

export async function ensureSessionFromToken(token: string) {
  const { sessionId } = verifyJWT(token);
  const session = await Session.ensureExistence(sessionId);
  if (session.closedAt) throw new Error('Session is already closed');
  return session;
}

export async function ensureSession(ctx: Context) {
  const { token } = ctx;
  if (!token) throw new Error('Missing token');
  return ensureSessionFromToken(token);
}

async function _ensureSessionUser(token: string) {
  const { sessionId } = verifyJWT(token);
  if (!sessionId) throw new Error('Invalid sessionId');
  const session = await Session.ensureExistence(sessionId);
  const user = await User.ensureExistence(session.userId);
  return user;
}

export async function ensureSessionUser(ctx: Context) {
  const { token } = ctx;
  if (!token) throw new Error('Missing token');
  return ctx.memoized(_ensureSessionUser, token);
}
