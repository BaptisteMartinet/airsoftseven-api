import { GraphQLFloat, GraphQLNonNull, GraphQLString } from 'graphql';
import { genModelMutations } from '@sequelize-graphql/core';
import { Field } from '@definitions/models';
import { ensureSessionUser } from '@definitions/helpers/Session';

export default genModelMutations(Field, {
  prefix: 'Authenticated',
  create: {
    args: {
      name: { type: new GraphQLNonNull(GraphQLString) },
      address: { type: new GraphQLNonNull(GraphQLString) },
      latitude: { type: new GraphQLNonNull(GraphQLFloat) },
      longitude: { type: new GraphQLNonNull(GraphQLFloat) },
    },
    async resolve(_, args, ctx) {
      const { name, address, latitude, longitude } = args;
      const user = await ensureSessionUser(ctx);
      return Field.model.create({ name, address, latitude, longitude, userId: user.id });
    },
  },
});
