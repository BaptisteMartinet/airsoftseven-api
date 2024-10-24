import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { Event } from '@definitions/models';
import { EventGamemodeTypeEnum, type EventGamemodeType } from '@definitions/enums';

export interface EventTypeModel extends InferModelAttributesWithDefaults<EventTypeModel> {
  type: EventGamemodeType;

  eventId: ForeignKey<IdType>;
}

const EventGamemode: Model<EventTypeModel> = new Model({
  name: 'EventGamemode',
  columns: {
    type: { type: EventGamemodeTypeEnum, allowNull: false, exposed: true },
  },
  indexes: [{ fields: ['eventId', 'type'], unique: true }],
  associations: () => ({
    event: {
      model: Event,
      type: 'belongsTo',
      deleteCascade: true,
      exposed: false,
    },
  }),
  sequelize,
});

export default EventGamemode;
