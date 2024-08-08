import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, DATE } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { Event } from './index';

export interface EventDateModel extends InferModelAttributesWithDefaults<EventDateModel> {
  date: Date;

  eventId: ForeignKey<IdType>;
}

const EventDate: Model<EventDateModel> = new Model({
  name: 'EventDate',
  columns: {
    date: { type: DATE, allowNull: false, exposed: true },
  },
  associations: () => ({
    event: {
      model: Event,
      type: 'belongsTo',
      exposed: true,
    },
  }),
  sequelize,
});

export default EventDate;
