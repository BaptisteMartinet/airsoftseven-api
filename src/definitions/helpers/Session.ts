import type { Context } from '@/context';

import { attachMemoizerArgsFormatter } from '@sequelize-graphql/core/src/utils/memoize'; // todo test import
import { Session, User } from '@definitions/models';

export async function ensureSession(ctx: Context) {
  const { sessionId } = ctx;
  if (!sessionId) throw new Error('Missing session');
  const session = await Session.ensureExistence(sessionId, { ctx });
  const now = new Date();
  if (session.expireAt < now)
    throw new Error('Session is expired'); // todo error
  if (session.closedAt)
    throw new Error('Session is closed'); // todo error
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
