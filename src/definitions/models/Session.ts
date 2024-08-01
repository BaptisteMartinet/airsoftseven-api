import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { DATE, Model } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { User } from './index';

export interface SessionModel extends InferModelAttributesWithDefaults<SessionModel> {
  expireAt: Date;
  closedAt: Date | null;

  userId: ForeignKey<IdType>;
}

const Session: Model<SessionModel> = new Model({
  name: 'Session',
  columns: {
    expireAt: { type: DATE, allowNull: false, exposed: true },
    closedAt: { type: DATE, allowNull: true, exposed: false },
  },
  associations: () => ({
    user: {
      model: User,
      type: 'belongsTo',
      exposed: true,
    },
  }),
  sequelize,
});

export default Session;
