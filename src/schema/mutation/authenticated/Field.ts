import { GraphQLFloat, GraphQLNonNull, GraphQLString } from 'graphql';
import { genModelMutations } from '@sequelize-graphql/core';
import { Field } from '@definitions/models';
import { ensureSessionUser } from '@definitions/helpers/Session';

export default genModelMutations(Field, {
  prefix: 'Authenticated',
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
      const user = await ensureSessionUser(ctx);
      return Field.model.create({ ...fields, userId: user.id });
    },
  },
});
