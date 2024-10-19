import type { Context } from '@/context';

import { differenceInMilliseconds } from 'date-fns';
import { attachMemoizerArgsFormatter, IdType } from '@sequelize-graphql/core';
import { AuthRequired, UserBanned } from '@utils/errors';
import { Day } from '@/utils/time';
import { __DOMAIN__, __PROD__ } from '@/constants/env';
import { Session, type SessionModel, User } from '@definitions/models';

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

const SessionActiveDays = 30;

export async function createSession(userId: IdType) {
  const now = new Date();
  const expireAt = new Date(now.getTime() + Day * SessionActiveDays);
  return Session.model.create({
    userId,
    expireAt,
    usedAt: now,
  });
}

const SessionCookieName = 'session';

export function setSessionCookie(session: SessionModel, ctx: Context) {
  const now = new Date();
  const maxAge = differenceInMilliseconds(session.expireAt, now);
  ctx.res.cookie(SessionCookieName, session.id, {
    maxAge,
    httpOnly: true,
    secure: __PROD__,
    signed: true,
    sameSite: 'lax',
    path: '/',
    domain: __PROD__ ? `.${__DOMAIN__}` : '',
  });
}
