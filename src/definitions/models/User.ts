import type { InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, STRING } from '@sequelize-graphql/core';
import db from '@db/index';
import { Game } from './index';

export interface UserModel extends InferModelAttributesWithDefaults<UserModel> {
  username: string;
  email: string;
  passwordHash: string;
}

const User: Model<UserModel> = new Model({
  name: 'User',
  columns: {
    username: { type: STRING, allowNull: false, exposed: true },
    email: { type: STRING, allowNull: false, exposed: true },
    passwordHash: { type: STRING, allowNull: false, exposed: false },
  },
  associations: () => ({
    games: {
      model: Game,
      type: 'hasMany',
      exposed: true,
    },
  }),
  sequelize: db,
});

export default User;
