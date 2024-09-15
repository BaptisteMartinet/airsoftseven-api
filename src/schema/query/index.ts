import type { Model } from '@sequelize-graphql/core';
import type { Context } from '@/context';
import type { SessionModel } from '@definitions/models';

import { GraphQLFieldConfig, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { exposeModel } from '@sequelize-graphql/core';
import { ResourceDoesNotExist } from '@/utils/errors';
import { Hour } from '@/utils/time';
import { Session, Event, Club, Field, User } from '@definitions/models';
import { ensureSession } from '@/definitions/helpers/Session';

function makeFindBySlugField(model: Model<any>) {
  return {
    type: new GraphQLNonNull(model.type),
    args: {
      slug: { type: new GraphQLNonNull(GraphQLString) },
    },
    async resolve(_, args, ctx) {
      const { slug } = args;
      const instance = await model.model.findOne({ where: { slug } });
      if (!instance) throw new ResourceDoesNotExist(Event.name, slug);
      return instance;
    },
  } as const satisfies GraphQLFieldConfig<unknown, Context>;
}

async function trackSessionUsage(session: SessionModel) {
  const { usedAt } = session;
  const now = new Date();
  const hoursDiff = (now.getTime() - usedAt.getTime()) / Hour;
  if (hoursDiff > 12) await session.update({ usedAt: now });
}

export default new GraphQLObjectType<unknown, Context>({
  name: 'Query',
  fields: () => ({
    session: {
      type: Session.type,
      async resolve(_, args, ctx) {
        try {
          const session = await ensureSession(ctx);
          await trackSessionUsage(session);
          return session;
        } catch (e) {
          return null;
        }
      },
    },

    ...exposeModel(Event, {
      findById: false,
      findByIds: false,
      pagination: 'events',
    }),

    event: makeFindBySlugField(Event),

    ...exposeModel(Club, {
      findById: false,
      findByIds: false,
      pagination: 'clubs',
    }),

    club: makeFindBySlugField(Club),

    ...exposeModel(Field, {
      findById: false,
      findByIds: false,
      pagination: 'fields',
    }),

    field: makeFindBySlugField(Field),

    user: makeFindBySlugField(User),
  }),
});
