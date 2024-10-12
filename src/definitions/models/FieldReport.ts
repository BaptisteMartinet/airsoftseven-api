import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { Field, Report } from '@definitions/models';

export interface FieldReportModel extends InferModelAttributesWithDefaults<FieldReportModel> {
  fieldId: ForeignKey<IdType>;
  reportId: ForeignKey<IdType>;
}

const FieldReport: Model<FieldReportModel> = new Model({
  name: 'FieldReport',
  columns: {},
  indexes: [{ fields: ['reportId'], unique: true }],
  associations: () => ({
    field: {
      model: Field,
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

export default FieldReport;
