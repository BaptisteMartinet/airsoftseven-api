import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, TEXT } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { User, ClubReport, FieldReport, EventReport, UserReport } from '@definitions/models';
import { ReportReasonEnum, type ReportReason } from '@definitions/enums';

export interface ReportModel extends InferModelAttributesWithDefaults<ReportModel> {
  reason: ReportReason;
  message: string | null;

  authorId: ForeignKey<IdType>;
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
      deleteCascade: true,
      foreignKey: 'authorId',
      exposed: true,
    },
    clubReport: {
      model: ClubReport,
      type: 'hasOne',
      foreignKey: 'reportId',
      deleteCascade: true,
      exposed: false,
    },
    fieldReport: {
      model: FieldReport,
      type: 'hasOne',
      foreignKey: 'reportId',
      deleteCascade: true,
      exposed: false,
    },
    eventReport: {
      model: EventReport,
      type: 'hasOne',
      foreignKey: 'reportId',
      deleteCascade: true,
      exposed: false,
    },
    userReport: {
      model: UserReport,
      type: 'hasOne',
      foreignKey: 'reportId',
      deleteCascade: true,
      exposed: false,
    },
  }),
  sequelize,
});

export default Report;
