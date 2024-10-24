import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, ID } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { Club, Report } from '@definitions/models';

export interface ClubReportModel extends InferModelAttributesWithDefaults<ClubReportModel> {
  authorId: IdType;

  clubId: ForeignKey<IdType>;
  reportId: ForeignKey<IdType>;
}

const ClubReport: Model<ClubReportModel> = new Model({
  name: 'ClubReport',
  columns: {
    // Computed from Report.authorId
    authorId: { type: ID, allowNull: false, exposed: false },
  },
  indexes: [
    { fields: ['reportId'], unique: true },
    { fields: ['authorId', 'clubId'], unique: true },
  ],
  associations: () => ({
    club: {
      model: Club,
      type: 'belongsTo',
      deleteCascade: true,
      exposed: false,
    },
    report: {
      model: Report,
      type: 'belongsTo',
      deleteCascade: true,
      exposed: false,
    },
  }),
  sequelize,
});

export default ClubReport;
