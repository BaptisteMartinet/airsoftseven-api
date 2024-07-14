import type { IdType } from '@sequelize-graphql/core';

import * as jwt from 'jsonwebtoken';
import { addMonths, differenceInSeconds } from 'date-fns';
import { Session } from '@definitions/models';
import { JWT_SECRET_KEY } from '@constants/env';

export async function createSession(userId: IdType) {
  const now = new Date();
  const expireAt = addMonths(now, 3);
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
