import type { InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, STRING, BOOLEAN } from '@sequelize-graphql/core';
import db from '@db/index';
import { Game } from './index';

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
    games: {
      model: Game,
      type: 'hasMany',
      exposed: true,
    },
  }),
  sequelize: db,
});

export default Club;
