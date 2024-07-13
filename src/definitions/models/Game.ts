import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { DATE, ID, Model, STRING } from '@sequelize-graphql/core';
import db from '@db/index';
import { User, Club, Field } from './index';

export interface GameModel extends InferModelAttributesWithDefaults<GameModel> {
  title: string;
  date: Date;
  authorId: IdType;
  clubId: IdType;
  fieldId: IdType;
}

const Game: Model<GameModel> = new Model({
  name: 'Game',
  columns: {
    title: { type: STRING, allowNull: false, exposed: true },
    date: { type: DATE, allowNull: false, exposed: true },
    authorId: { type: ID, allowNull: false, exposed: false },
    clubId: { type: ID, allowNull: false, exposed: false },
    fieldId: { type: ID, allowNull: false, exposed: false },
  },
  associations: () => ({
    author: {
      model: User,
      type: 'belongsTo',
      exposed: true,
    },
    club: {
      model: Club,
      type: 'belongsTo',
      exposed: true,
    },
    field: {
      model: Field,
      type: 'belongsTo',
      exposed: true,
    },
  }),
  sequelize: db,
});

export default Game;
