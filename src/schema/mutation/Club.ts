import { GraphQLBoolean, GraphQLNonNull, GraphQLString } from 'graphql';
import { genModelMutations, genSlug, validateModelFields } from '@sequelize-graphql/core';
import { ClientError, InvalidPermissions } from '@/utils/errors';
import { ensureNotSpam } from '@/utils/model';
import { Club, Event } from '@definitions/models';
import { ensureSessionUser } from '@definitions/helpers/Session';

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
      validateModelFields(Club, fields);
      const user = await ensureSessionUser(ctx);
      await ensureNotSpam(Club, user.id, { userIdColumn: 'authorId' });
      return Club.model.create({
        ...fields,
        authorId: user.id,
        ...(await genSlug(name, Club)),
      });
    },
  },

  delete: {
    async resolve(club, args, ctx) {
      const user = await ensureSessionUser(ctx);
      if (user.id !== club.authorId) throw new InvalidPermissions('InvalidPermissions');
      const hasEvents = await Event.exists({ where: { clubId: club.id } });
      if (hasEvents) throw new ClientError('ClubHasEvents', 'A club with events cannot be deleted');
      await club.destroy();
    },
  },
});
