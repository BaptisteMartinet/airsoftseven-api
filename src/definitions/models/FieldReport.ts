import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, ID } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { Field, Report } from '@definitions/models';

export interface FieldReportModel extends InferModelAttributesWithDefaults<FieldReportModel> {
  authorId: IdType;

  fieldId: ForeignKey<IdType>;
  reportId: ForeignKey<IdType>;
}

const FieldReport: Model<FieldReportModel> = new Model({
  name: 'FieldReport',
  columns: {
    // Computed from Report.authorId
    authorId: { type: ID, allowNull: false, exposed: false },
  },
  indexes: [
    { fields: ['reportId'], unique: true },
    { fields: ['authorId', 'fieldId'], unique: true },
  ],
  associations: () => ({
    field: {
      model: Field,
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

export default FieldReport;
