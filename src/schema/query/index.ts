import type { Context } from '@/context';

import { GraphQLObjectType } from 'graphql';
import { genModelOffsetPagination } from '@sequelize-graphql/core';
import { Session, Event } from '@definitions/models';
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

    events: genModelOffsetPagination(Event),
  }),
});
