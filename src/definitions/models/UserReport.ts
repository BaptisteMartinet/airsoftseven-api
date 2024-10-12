import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { User, Report } from '@definitions/models';

export interface UserReportModel extends InferModelAttributesWithDefaults<UserReportModel> {
  userId: ForeignKey<IdType>;
  reportId: ForeignKey<IdType>;
}

const UserReport: Model<UserReportModel> = new Model({
  name: 'UserReport',
  columns: {},
  indexes: [{ fields: ['reportId'], unique: true }],
  associations: () => ({
    user: {
      model: User,
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

export default UserReport;
