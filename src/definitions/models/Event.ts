import type { CreationOptional, ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, DATE, STRING, FLOAT, INTEGER, TEXT, hasLength, isDateBetween, isBetween } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { User, Club, Field, EventReport, EventGamemode, EventInterest } from '@definitions/models';
import { SlugColumns, type SlugColumnsT } from '@definitions/models/shared';
import fields from '@schema/model/Event';

export interface EventModel extends SlugColumnsT, InferModelAttributesWithDefaults<EventModel> {
  title: string;
  description: string | null;
  date: Date;
  dateTzOffset: number;
  durationDays: CreationOptional<number>;
  price: number | null;
  capacity: number | null;
  publicURL: string | null;

  authorId: ForeignKey<IdType>;
  clubId: ForeignKey<IdType>;
  fieldId: ForeignKey<IdType>;
}

const Event: Model<EventModel> = new Model({
  name: 'Event',
  columns: {
    title: { type: STRING, allowNull: false, exposed: true, validate: hasLength({ min: 3, max: 100 }) },
    description: { type: TEXT, allowNull: true, exposed: true, validate: hasLength({ max: 2000 }) },
    date: { type: DATE, allowNull: false, exposed: true, validate: isDateBetween({ relativeMinYears: 20, relativeMaxYears: 20 }) },
    dateTzOffset: { type: INTEGER, allowNull: false, exposed: true },
    durationDays: { type: INTEGER, allowNull: false, defaultValue: 1, exposed: true, validate: isBetween({ min: 1, max: 100 }) },
    price: { type: FLOAT, allowNull: true, exposed: true, validate: isBetween({ min: 0 }) },
    capacity: { type: INTEGER, allowNull: true, exposed: true, validate: isBetween({ min: 0 }) },
    publicURL: { type: STRING, allowNull: true, exposed: true },

    ...SlugColumns,
  },
  fields,
  associations: () => ({
    author: {
      model: User,
      type: 'belongsTo',
      foreignKey: 'authorId',
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
    gamemodes: {
      model: EventGamemode,
      type: 'hasMany',
      deleteCascade: true,
      exposed: true,
    },
    reports: {
      model: EventReport,
      type: 'hasMany',
      exposed: false,
    },
    interests: {
      model: EventInterest,
      type: 'hasMany',
      deleteCascade: true,
      exposed: true,
    },
  }),
  sequelize,
});

export default Event;
