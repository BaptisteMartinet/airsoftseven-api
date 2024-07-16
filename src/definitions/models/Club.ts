import type { InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, STRING, BOOLEAN } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { Event } from './index';

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
    events: {
      model: Event,
      type: 'hasMany',
      exposed: true,
    },
  }),
  sequelize,
});

export default Club;
