import type { InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { DOUBLE, Model, STRING } from '@sequelize-graphql/core';
import db from '@db/index';
import { Event } from './index';

export interface FieldModel extends InferModelAttributesWithDefaults<FieldModel> {
  title: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
}

const Field: Model<FieldModel> = new Model({
  name: 'Field',
  columns: {
    title: { type: STRING, allowNull: false, exposed: true },
    description: { type: STRING, allowNull: true, exposed: true },
    address: { type: STRING, allowNull: false, exposed: true },
    latitude: { type: DOUBLE, allowNull: false, exposed: true },
    longitude: { type: DOUBLE, allowNull: false, exposed: true },
  },
  associations: () => ({
    events: {
      model: Event,
      type: 'hasMany',
      exposed: true,
    },
  }),
  sequelize: db,
});

export default Field;
