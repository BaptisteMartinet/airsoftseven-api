import type { Context } from '@/context';

import { attachMemoizerArgsFormatter } from '@sequelize-graphql/core';
import { AuthRequired, UserBanned } from '@utils/errors';
import { Session, User } from '@definitions/models';

async function ensureSessionWithUser(ctx: Context) {
  const { sessionId } = ctx;
  if (!sessionId) throw new AuthRequired('Missing session cookie');
  const session = await Session.ensureExistence(sessionId, { ctx });
  const now = new Date();
  if (session.expireAt < now) throw new AuthRequired('Session expired');
  if (session.closedAt) throw new AuthRequired('Session closed');
  const user = await User.ensureExistence(session.userId, { ctx });
  if (user.bannedAt) throw new UserBanned();
  return { session, user };
}

export async function ensureSession(ctx: Context) {
  const { session } = await ensureSessionWithUser(ctx);
  return session;
}

async function _getSessionUser(ctx: Context) {
  const res = await ensureSessionWithUser(ctx).catch(() => null);
  if (!res) return null;
  return res.user;
}
attachMemoizerArgsFormatter(_getSessionUser, ([ctx]) => ctx.sessionId ?? '');

export function getSessionUser(ctx: Context) {
  return ctx.memoized(_getSessionUser, ctx);
}

export async function ensureSessionUser(ctx: Context) {
  const user = await getSessionUser(ctx);
  if (!user) throw new AuthRequired('AuthRequired');
  return user;
}
