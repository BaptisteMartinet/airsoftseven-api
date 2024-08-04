import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { DATE, Model, STRING, FLOAT, INTEGER } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { User, Club, Field } from './index';

/**
 * TODO
 * - Puissances des repliques
 * - Horaires
 */

export interface EventModel extends InferModelAttributesWithDefaults<EventModel> {
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  price: number | null;
  capacity: number | null;
  publicUrl: string | null;

  userId: ForeignKey<IdType>;
  clubId: ForeignKey<IdType>;
  fieldId: ForeignKey<IdType>;
}

const Event: Model<EventModel> = new Model({
  name: 'Event',
  columns: {
    title: { type: STRING, allowNull: false, exposed: true },
    description: { type: STRING, allowNull: true, exposed: true },
    startDate: { type: DATE, allowNull: false, exposed: true },
    endDate: { type: DATE, allowNull: true, exposed: true },
    price: { type: FLOAT, allowNull: true, exposed: true },
    capacity: { type: INTEGER, allowNull: true, exposed: true },
    publicUrl: { type: STRING, allowNull: true, exposed: true },
  },
  associations: () => ({
    user: {
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
  sequelize,
});

export default Event;
