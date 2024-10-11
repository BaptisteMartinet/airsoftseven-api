import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, TEXT } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { ClubReport, User } from '@definitions/models';
import { ReportReasonEnum, type ReportReason } from '@definitions/enums';

export interface ReportModel extends InferModelAttributesWithDefaults<ReportModel> {
  reason: ReportReason;
  message: string | null;

  userId: ForeignKey<IdType>;
}

const Report: Model<ReportModel> = new Model({
  name: 'Report',
  columns: {
    reason: { type: ReportReasonEnum, allowNull: false, exposed: true },
    message: { type: TEXT, allowNull: true, exposed: true },
  },
  associations: () => ({
    user: {
      model: User,
      type: 'belongsTo',
      exposed: true,
    },
    report: {
      model: ClubReport,
      type: 'hasOne',
      exposed: false,
    },
  }),
  sequelize,
});

export default Report;
