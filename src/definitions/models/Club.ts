import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, STRING, BOOLEAN, TEXT } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { Event, User, ClubReport } from '@definitions/models';
import { SlugColumns, type SlugColumnsT } from '@definitions/models/shared';
import fields from '@schema/model/Club';

/**
 * TODO Gerer les points suivants
 * - Style de jeu pratiqués
 * - Siege social
 * - Nombre de membres
 * - Président
 * - Type d'assurance
 */

export interface ClubModel extends SlugColumnsT, InferModelAttributesWithDefaults<ClubModel> {
  name: string;
  description: string | null;
  publicURL: string | null;
  rules: string | null;
  rentals: boolean | null;
  acceptUnderage: boolean | null;

  userId: ForeignKey<IdType>;
}

const Club: Model<ClubModel> = new Model({
  name: 'Club',
  columns: {
    name: { type: STRING, allowNull: false, exposed: true },
    description: { type: TEXT, allowNull: true, exposed: true },
    publicURL: { type: STRING, allowNull: true, exposed: true },
    rules: { type: TEXT, allowNull: true, exposed: true },
    rentals: { type: BOOLEAN, allowNull: true, exposed: true },
    acceptUnderage: { type: BOOLEAN, allowNull: true, exposed: true },

    ...SlugColumns,
  },
  fields,
  associations: () => ({
    user: {
      model: User,
      type: 'belongsTo',
      exposed: true,
    },
    events: {
      model: Event,
      type: 'hasMany',
      exposed: true,
    },
    reports: {
      model: ClubReport,
      type: 'hasMany',
      exposed: false,
    },
  }),
  sequelize,
});

export default Club;
