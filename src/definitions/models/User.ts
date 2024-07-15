import type { CreationOptional } from 'sequelize';
import type { IdType, InferModelAttributes } from '@sequelize-graphql/core';

import { Model, STRING, BOOLEAN } from '@sequelize-graphql/core';
import db from '@db/index';
import { Event } from './index';

export interface UserModel extends InferModelAttributes<UserModel> {
  id: CreationOptional<IdType>;
  username: string;
  email: string;
  emailVerified: CreationOptional<boolean>;
  passwordHash: string;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
}

const User: Model<UserModel> = new Model({
  name: 'User',
  columns: {
    username: { type: STRING, allowNull: false, exposed: true },
    email: { type: STRING, allowNull: false, exposed: false },
    emailVerified: { type: BOOLEAN, allowNull: false, defaultValue: false, exposed: false },
    passwordHash: { type: STRING, allowNull: false, exposed: false },
  },
  indexes: [
    { fields: ['username'], unique: true },
    { fields: ['email'], unique: true },
  ],
  associations: () => ({
    events: {
      model: Event,
      type: 'hasMany',
      exposed: true,
    },
  }),
  sequelize: db,
});

export default User;
