import type { Context } from '@/context';

import { attachMemoizerArgsFormatter } from '@sequelize-graphql/core';
import { Session, User } from '@definitions/models';
import { AuthRequired } from '@utils/errors';

export async function ensureSession(ctx: Context) {
  const { sessionId } = ctx;
  if (!sessionId) throw new AuthRequired('Missing session cookie');
  const session = await Session.ensureExistence(sessionId, { ctx });
  const now = new Date();
  if (session.expireAt < now) throw new AuthRequired('Session expired');
  if (session.closedAt) throw new AuthRequired('Session closed');
  return session;
}

async function _ensureSessionUser(ctx: Context) {
  const session = await ensureSession(ctx);
  return User.ensureExistence(session.userId, { ctx });
}
attachMemoizerArgsFormatter(_ensureSessionUser, ([ctx]) => ctx.sessionId ?? '');

export async function ensureSessionUser(ctx: Context) {
  return ctx.memoized(_ensureSessionUser, ctx);
}
