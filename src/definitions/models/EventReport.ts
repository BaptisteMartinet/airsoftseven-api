import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, ID } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { Event, Report } from '@definitions/models';

export interface EventReportModel extends InferModelAttributesWithDefaults<EventReportModel> {
  authorId: IdType;

  eventId: ForeignKey<IdType>;
  reportId: ForeignKey<IdType>;
}

const EventReport: Model<EventReportModel> = new Model({
  name: 'EventReport',
  columns: {
    // Computed from Report.authorId
    authorId: { type: ID, allowNull: false, exposed: false },
  },
  indexes: [
    { fields: ['reportId'], unique: true },
    { fields: ['authorId', 'eventId'], unique: true },
  ],
  associations: () => ({
    event: {
      model: Event,
      type: 'belongsTo',
      exposed: false,
    },
    report: {
      model: Report,
      type: 'belongsTo',
      exposed: false,
    },
  }),
  sequelize,
});

export default EventReport;
