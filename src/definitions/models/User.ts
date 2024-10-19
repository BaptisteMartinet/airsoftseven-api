import type { CreationOptional } from 'sequelize';
import type { InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, STRING, BOOLEAN, DATE } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { UserRoleEnum, UserRole } from '@definitions/enums';
import { Club, Event, Field, Report, Session, UserReport } from '@definitions/models';
import { SlugColumns, type SlugColumnsT } from '@definitions/models/shared';
import fields from '@schema/model/User';

export interface UserModel extends SlugColumnsT, InferModelAttributesWithDefaults<UserModel> {
  username: string;
  email: string;
  passwordHash: string;
  newsletterOptIn: CreationOptional<boolean>;
  role: UserRole | null;
  bannedAt: Date | null;
}

const User: Model<UserModel> = new Model({
  name: 'User',
  columns: {
    username: { type: STRING, allowNull: false, exposed: true },
    email: { type: STRING, allowNull: false, exposed: false },
    passwordHash: { type: STRING, allowNull: false, exposed: false },
    newsletterOptIn: { type: BOOLEAN, allowNull: false, defaultValue: false, exposed: false },
    role: { type: UserRoleEnum, allowNull: true, exposed: false },
    bannedAt: { type: DATE, allowNull: true, exposed: false },

    ...SlugColumns,
  },
  indexes: [{ fields: ['email'], unique: true }],
  fields,
  associations: () => ({
    sessions: {
      model: Session,
      type: 'hasMany',
      exposed: false,
    },
    clubs: {
      model: Club,
      type: 'hasMany',
      foreignKey: 'authorId',
      exposed: true,
    },
    fields: {
      model: Field,
      type: 'hasMany',
      foreignKey: 'authorId',
      exposed: true,
    },
    events: {
      model: Event,
      type: 'hasMany',
      foreignKey: 'authorId',
      exposed: true,
    },
    reports: {
      model: Report,
      type: 'hasMany',
      foreignKey: 'authorId',
      exposed: true,
    },
    userReports: {
      model: UserReport,
      type: 'hasMany',
      exposed: false,
    },
  }),
  sequelize,
});

export default User;
