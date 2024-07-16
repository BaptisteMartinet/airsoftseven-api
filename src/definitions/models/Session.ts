import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { DATE, Model, STRING } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { User } from './index';

export interface SessionModel extends InferModelAttributesWithDefaults<SessionModel> {
  token: string;
  refreshToken: string;
  expireAt: Date;
  closedAt: Date | null;

  userId: ForeignKey<IdType>;
}

const Session: Model<SessionModel> = new Model({
  name: 'Session',
  columns: {
    token: { type: STRING, allowNull: false, exposed: true },
    refreshToken: { type: STRING, allowNull: false, exposed: false },
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
