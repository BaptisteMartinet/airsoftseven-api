import type { Context } from '@/context';

import { GraphQLObjectType } from 'graphql';
import { exposeModel } from '@sequelize-graphql/core';
import { Session, Event, Club, Field } from '@definitions/models';
import { ensureSession } from '@/definitions/helpers/Session';

export default new GraphQLObjectType<unknown, Context>({
  name: 'Query',
  fields: () => ({
    session: {
      type: Session.type,
      async resolve(_, args, ctx) {
        try {
          return await ensureSession(ctx);
        } catch (e) {
          return null;
        }
      },
    },

    ...exposeModel(Event, {
      findById: 'event',
      findByIds: false,
      pagination: 'events',
    }),

    ...exposeModel(Club, {
      findById: 'club',
      findByIds: false,
      pagination: 'clubs',
    }),

    ...exposeModel(Field, {
      findById: 'field',
      findByIds: false,
      pagination: 'fields',
    }),
  }),
});
