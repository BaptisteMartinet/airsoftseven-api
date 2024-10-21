import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { Event, User } from '@definitions/models';

export interface EventInterestModel extends InferModelAttributesWithDefaults<EventInterestModel> {
  eventId: ForeignKey<IdType>;
  userId: ForeignKey<IdType>;
}

const EventInterest: Model<EventInterestModel> = new Model({
  name: 'EventInterest',
  columns: {},
  indexes: [{ fields: ['eventId', 'userId'], unique: true }],
  associations: () => ({
    event: {
      model: Event,
      type: 'belongsTo',
      exposed: false,
    },
    user: {
      model: User,
      type: 'belongsTo',
      exposed: false,
    },
  }),
  sequelize,
});

export default EventInterest;
