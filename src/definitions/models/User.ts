import type { CreationOptional } from 'sequelize';
import type { InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, STRING, BOOLEAN } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { Club, Event, Field, Session } from './index';

export interface UserModel extends InferModelAttributesWithDefaults<UserModel> {
  username: string;
  email: string;
  emailVerified: CreationOptional<boolean>;
  passwordHash: string;
  newsletterOptIn: CreationOptional<boolean>;
}

const User: Model<UserModel> = new Model({
  name: 'User',
  columns: {
    username: { type: STRING, allowNull: false, exposed: true },
    email: { type: STRING, allowNull: false, exposed: false },
    emailVerified: { type: BOOLEAN, allowNull: false, defaultValue: false, exposed: false },
    passwordHash: { type: STRING, allowNull: false, exposed: false },
    newsletterOptIn: { type: BOOLEAN, allowNull: false, defaultValue: false, exposed: true },
  },
  indexes: [
    { fields: ['username'], unique: true },
    { fields: ['email'], unique: true },
  ],
  associations: () => ({
    sessions: {
      model: Session,
      type: 'hasMany',
      exposed: false,
    },
    clubs: {
      model: Club,
      type: 'hasMany',
      exposed: true,
    },
    fields: {
      model: Field,
      type: 'hasMany',
      exposed: true,
    },
    events: {
      model: Event,
      type: 'hasMany',
      exposed: true,
    },
  }),
  sequelize,
});

export default User;
