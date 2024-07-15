import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { DATE, ID, Model, STRING, INTEGER } from '@sequelize-graphql/core';
import db from '@db/index';
import { User, Club, Field } from './index';

/**
 * TODO
 * - Puissances des repliques
 * - Horaires
 */

export interface EventModel extends InferModelAttributesWithDefaults<EventModel> {
  title: string;
  date: Date;
  price: number | null;
  publicUrl: string | null;
  authorId: IdType;
  clubId: IdType;
  fieldId: IdType;
}

const Event: Model<EventModel> = new Model({
  name: 'Event',
  columns: {
    title: { type: STRING, allowNull: false, exposed: true },
    date: { type: DATE, allowNull: false, exposed: true },
    price: { type: INTEGER, allowNull: true, exposed: true },
    publicUrl: { type: STRING, allowNull: true, exposed: true },
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

export default Event;
