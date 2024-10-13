import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { DOUBLE, Model, STRING, TEXT } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { Event, User, FieldReport } from '@definitions/models';
import { SlugColumns, type SlugColumnsT } from '@definitions/models/shared';
import fields from '@schema/model/Field';

export interface FieldModel extends SlugColumnsT, InferModelAttributesWithDefaults<FieldModel> {
  name: string;
  description: string | null;
  address: string;
  latitude: string;
  longitude: string;
  publicURL: string;

  userId: ForeignKey<IdType>;
}

const Field: Model<FieldModel> = new Model({
  name: 'Field',
  columns: {
    name: { type: STRING, allowNull: false, exposed: true },
    description: { type: TEXT, allowNull: true, exposed: true },
    address: { type: STRING, allowNull: false, exposed: true },
    latitude: { type: DOUBLE, allowNull: false, exposed: true },
    longitude: { type: DOUBLE, allowNull: false, exposed: true },
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
    events: {
      model: Event,
      type: 'hasMany',
      exposed: true,
    },
    reports: {
      model: FieldReport,
      type: 'hasMany',
      exposed: false,
    },
  }),
  sequelize,
});

export default Field;
