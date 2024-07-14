import type { CreationOptional } from 'sequelize';
import type { IdType, InferModelAttributes } from '@sequelize-graphql/core';

import { DATE, ID, Model, STRING } from '@sequelize-graphql/core';
import db from '@db/index';
import { User } from './index';

export interface SessionModel extends InferModelAttributes<SessionModel> {
  id: CreationOptional<IdType>;
  token: string;
  refreshToken: string;
  expireAt: Date;
  userId: IdType;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
}

const Session: Model<SessionModel> = new Model({
  name: 'Session',
  columns: {
    token: { type: STRING, allowNull: false, exposed: true },
    refreshToken: { type: STRING, allowNull: false, exposed: true },
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
