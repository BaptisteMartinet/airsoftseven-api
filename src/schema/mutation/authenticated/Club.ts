import { GraphQLBoolean, GraphQLNonNull, GraphQLString } from 'graphql';
import { genModelMutations, genSlug } from '@sequelize-graphql/core';
import { Club } from '@definitions/models';
import { ensureSessionUser } from '@definitions/helpers/Session';

export default genModelMutations(Club, {
  prefix: 'Authenticated',
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
      return Club.model.create({
        ...fields,
        userId: user.id,
        ...(await genSlug(name, Club)),
      });
    },
  },
});
