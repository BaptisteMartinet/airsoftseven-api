import { GraphQLFloat, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql';
import { genModelMutations, GraphQLDate } from '@sequelize-graphql/core';
import { Club, Event, Field } from '@definitions/models';
import { ensureSessionUser } from '@definitions/helpers/Session';

export default genModelMutations(Event, {
  prefix: 'Authenticated',
  create: {
    args: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      description: { type: GraphQLString },
      startDate: { type: new GraphQLNonNull(GraphQLDate) },
      endDate: { type: GraphQLDate },
      price: { type: GraphQLFloat },
      capacity: { type: GraphQLInt },
      clubId: { type: new GraphQLNonNull(GraphQLID) },
      fieldId: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(_, args, ctx) {
      const fields = args;
      const { clubId, fieldId } = fields;
      const user = await ensureSessionUser(ctx);
      await Promise.all([Club.ensureExistence(clubId, { ctx }), Field.ensureExistence(fieldId, { ctx })]);
      return Event.model.create({ ...fields, userId: user.id });
    },
  },
});
