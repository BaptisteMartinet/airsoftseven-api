import { GraphQLFloat, GraphQLNonNull, GraphQLString } from 'graphql';
import { genModelMutations, genSlug } from '@sequelize-graphql/core';
import { ClientError, InvalidPermissions } from '@/utils/errors';
import { ensureNotSpam } from '@/utils/model';
import { Field, Event } from '@definitions/models';
import { ensureSessionUser } from '@definitions/helpers/Session';

export default genModelMutations(Field, {
  create: {
    args: {
      name: { type: new GraphQLNonNull(GraphQLString) },
      description: { type: GraphQLString },
      address: { type: new GraphQLNonNull(GraphQLString) },
      latitude: { type: new GraphQLNonNull(GraphQLFloat) },
      longitude: { type: new GraphQLNonNull(GraphQLFloat) },
      publicURL: { type: GraphQLString },
    },
    async resolve(_, args, ctx) {
      const fields = args;
      const { name } = fields;
      const user = await ensureSessionUser(ctx);
      await ensureNotSpam(Field, user.id);
      return Field.model.create({
        ...fields,
        authorId: user.id,
        ...(await genSlug(name, Field)),
      });
    },
  },

  delete: {
    async resolve(field, args, ctx) {
      const user = await ensureSessionUser(ctx);
      if (user.id !== field.authorId) throw new InvalidPermissions('InvalidPermissions');
      const hasEvents = await Event.exists({ where: { fieldId: field.id } });
      if (hasEvents) throw new ClientError('FieldHasEvents', 'A field with events cannot be deleted');
      await field.destroy();
    },
  },
});
