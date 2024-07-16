import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { DOUBLE, Model, STRING } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { Event, User } from './index';

export interface FieldModel extends InferModelAttributesWithDefaults<FieldModel> {
  name: string;
  description: string | null;
  address: string;
  latitude: string;
  longitude: string;

  userId: ForeignKey<IdType>;
}

const Field: Model<FieldModel> = new Model({
  name: 'Field',
  columns: {
    name: { type: STRING, allowNull: false, exposed: true },
    description: { type: STRING, allowNull: true, exposed: true },
    address: { type: STRING, allowNull: false, exposed: true },
    latitude: { type: DOUBLE, allowNull: false, exposed: true },
    longitude: { type: DOUBLE, allowNull: false, exposed: true },
  },
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
  }),
  sequelize,
});

export default Field;
