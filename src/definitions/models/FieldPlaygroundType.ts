import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { PlaygroundTypeEnum, PlaygroundType } from '@definitions/enums';
import { Field } from '@definitions/models';

export interface FieldPlaygroundTypeModel extends InferModelAttributesWithDefaults<FieldPlaygroundTypeModel> {
  type: PlaygroundType;
  fieldId: ForeignKey<IdType>;
}

const FieldPlaygroundType: Model<FieldPlaygroundTypeModel> = new Model({
  name: 'FieldPlaygroundType',
  columns: {
    type: { type: PlaygroundTypeEnum, allowNull: false, exposed: true },
  },
  indexes: [{ fields: ['fieldId', 'type'], unique: true }],
  associations: () => ({
    field: {
      model: Field,
      type: 'belongsTo',
      exposed: false,
    },
  }),
  sequelize,
});

export default FieldPlaygroundType;
