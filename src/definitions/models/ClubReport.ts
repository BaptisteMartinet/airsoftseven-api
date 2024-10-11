import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { Club, Report } from '@definitions/models';

export interface ClubReportModel extends InferModelAttributesWithDefaults<ClubReportModel> {
  clubId: ForeignKey<IdType>;
  reportId: ForeignKey<IdType>;
}

const ClubReport: Model<ClubReportModel> = new Model({
  name: 'ClubReport',
  columns: {},
  indexes: [{ fields: ['reportId'], unique: true }],
  associations: () => ({
    club: {
      model: Club,
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

export default ClubReport;
