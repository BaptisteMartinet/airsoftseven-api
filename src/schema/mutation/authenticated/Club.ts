import { GraphQLNonNull, GraphQLString } from 'graphql';
import { genModelMutations } from '@sequelize-graphql/core';
import { Club } from '@definitions/models';
import { ensureSessionUser } from '@definitions/helpers/Session';

export default genModelMutations(Club, {
  prefix: 'Authenticated',
  create: {
    args: {
      name: { type: new GraphQLNonNull(GraphQLString) },
    },
    async resolve(_, args, ctx) {
      const { name } = args;
      const user = await ensureSessionUser(ctx);
      return Club.model.create({ name, userId: user.id });
    },
  },
});
