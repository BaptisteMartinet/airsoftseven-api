import { GraphQLBoolean, GraphQLNonNull, GraphQLString } from 'graphql';
import { genModelMutations, genSlug } from '@sequelize-graphql/core';
import { ClientError, InvalidPermissions } from '@/utils/errors';
import { ensureNotSpam } from '@/utils/model';
import { Club, ClubReport, Event } from '@definitions/models';
import { ensureSessionUser } from '@definitions/helpers/Session';
import { makeReportFieldConfig } from '@/definitions/helpers/Report';

export default genModelMutations(Club, {
  create: {
    args: {
      name: { type: new GraphQLNonNull(GraphQLString) },
      description: { type: GraphQLString },
      publicURL: { type: GraphQLString },
      rules: { type: GraphQLString },
      rentals: { type: GraphQLBoolean },
      acceptUnderage: { type: GraphQLBoolean },
    },
    async resolve(_, args, ctx) {
      const fields = args;
      const { name } = fields;
      const user = await ensureSessionUser(ctx);
      await ensureNotSpam(Club, user.id);
      return Club.model.create({
        ...fields,
        userId: user.id,
        ...(await genSlug(name, Club)),
      });
    },
  },

  delete: {
    async resolve(club, args, ctx) {
      const user = await ensureSessionUser(ctx);
      if (user.id !== club.userId) throw new InvalidPermissions('InvalidPermissions');
      const hasEvents = await Event.exists({ where: { clubId: club.id } });
      if (hasEvents) throw new ClientError('ClubHasEvents', 'A club with events cannot be deleted');
      await club.destroy();
    },
  },

  fields: () => ({
    report: makeReportFieldConfig(Club, ClubReport, 'clubId'),
  }),
});
