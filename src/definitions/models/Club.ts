import type { ForeignKey } from 'sequelize';
import type { IdType, InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, STRING, BOOLEAN } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { Event, User } from './index';

/**
 * TODO Gerer les points suivants
 * - Style de jeu pratiqués
 * - Siege social
 * - Nombre de membres
 * - Président
 * - Type d'assurance
 */

export interface ClubModel extends InferModelAttributesWithDefaults<ClubModel> {
  name: string;
  description: string | null;
  publicUrl: string | null;
  rules: string | null;
  rental: boolean | null;
  acceptUnderage: boolean | null;

  userId: ForeignKey<IdType>;
}

const Club: Model<ClubModel> = new Model({
  name: 'Club',
  columns: {
    name: { type: STRING, allowNull: false, exposed: true },
    description: { type: STRING, allowNull: true, exposed: true },
    publicUrl: { type: STRING, allowNull: true, exposed: true },
    rules: { type: STRING, allowNull: true, exposed: true },
    rental: { type: BOOLEAN, allowNull: true, exposed: true },
    acceptUnderage: { type: BOOLEAN, allowNull: true, exposed: true },
  },
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
  }),
  sequelize,
});

export default Club;
