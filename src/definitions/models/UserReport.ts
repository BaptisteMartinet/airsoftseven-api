import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, ID } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { User, Report } from '@definitions/models';

export interface UserReportModel extends InferModelAttributesWithDefaults<UserReportModel> {
  authorId: IdType;
  userId: ForeignKey<IdType>;
  reportId: ForeignKey<IdType>;
}

const UserReport: Model<UserReportModel> = new Model({
  name: 'UserReport',
  columns: {
    // Computed from Report.authorId
    authorId: { type: ID, allowNull: false, exposed: false },
  },
  indexes: [
    { fields: ['reportId'], unique: true },
    { fields: ['authorId', 'userId'], unique: true },
  ],
  associations: () => ({
    user: {
      model: User,
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

export default UserReport;
