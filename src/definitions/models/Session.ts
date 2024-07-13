import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { DATE, ID, Model, STRING } from '@sequelize-graphql/core';
import db from '@db/index';
import { User } from './index';

export interface SessionModel extends InferModelAttributesWithDefaults<SessionModel> {
  token: string;
  expireAt: Date;
  userId: IdType;
}

const Session: Model<SessionModel> = new Model({
  name: 'User',
  columns: {
    token: { type: STRING, allowNull: false, exposed: true },
    expireAt: { type: DATE, allowNull: false, exposed: true },
    userId: { type: ID, allowNull: false, exposed: true },
  },
  associations: () => ({
    user: {
      model: User,
      type: 'belongsTo',
      exposed: true,
    },
  }),
  sequelize: db,
});

export default Session;
