import { Op } from 'sequelize';
import { Model, IdType } from '@sequelize-graphql/core';
import { Minute } from './time';
import { SpamDetected } from './errors';

// TODO Improve to handle multiple time frames? Make them mandatory?
export async function ensureNotSpam(
  model: Model<any>,
  userId: IdType,
  opts: {
    /** @default userId */
    userIdColumn?: string;
    /** @default 10 minutes */
    timeFrameMs?: number;
    /** @default 10 */
    recordsLimit?: number;
  } = {},
) {
  const { userIdColumn = 'userId', timeFrameMs = 10 * Minute, recordsLimit = 10 } = opts;
  const now = new Date();
  const startDate = now.getTime() - timeFrameMs;
  const recordsCount = await model.model.count({
    where: {
      [userIdColumn]: userId,
      createdAt: { [Op.gte]: startDate },
    },
  });
  if (recordsCount > recordsLimit) throw new SpamDetected();
}
