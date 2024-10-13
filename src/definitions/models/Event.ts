import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, DATE, STRING, FLOAT, INTEGER, TEXT } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { User, Club, Field, EventReport } from '@definitions/models';
import { SlugColumns, type SlugColumnsT } from '@definitions/models/shared';
import fields from '@schema/model/Event';

/**
 * TODO
 * - Puissances des repliques
 * - Horaires
 */

export interface EventModel extends SlugColumnsT, InferModelAttributesWithDefaults<EventModel> {
  title: string;
  description: string | null;
  date: Date;
  durationDays: number;
  price: number | null;
  capacity: number | null;
  publicURL: string | null;

  userId: ForeignKey<IdType>;
  clubId: ForeignKey<IdType>;
  fieldId: ForeignKey<IdType>;
}

const Event: Model<EventModel> = new Model({
  name: 'Event',
  columns: {
    title: { type: STRING, allowNull: false, exposed: true },
    description: { type: TEXT, allowNull: true, exposed: true },
    date: { type: DATE, allowNull: false, exposed: true },
    durationDays: { type: INTEGER, allowNull: false, defaultValue: 1, exposed: true },
    price: { type: FLOAT, allowNull: true, exposed: true },
    capacity: { type: INTEGER, allowNull: true, exposed: true },
    publicURL: { type: STRING, allowNull: true, exposed: true },

    ...SlugColumns,
  },
  fields,
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
    reports: {
      model: EventReport,
      type: 'hasMany',
      exposed: false,
    },
  }),
  sequelize,
});

export default Event;
