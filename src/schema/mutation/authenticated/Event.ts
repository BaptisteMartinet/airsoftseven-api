import { GraphQLFloat, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql';
import { genModelMutations, GraphQLDate, GraphQLNonNullList } from '@sequelize-graphql/core';
import { Event, Club, Field } from '@definitions/models';
import { ensureSessionUser } from '@definitions/helpers/Session';

export default genModelMutations(Event, {
  prefix: 'Authenticated',
  create: {
    args: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      description: { type: GraphQLString },
      date: { type: new GraphQLNonNull(GraphQLDate) },
      durationDays: { type: GraphQLInt },
      price: { type: GraphQLFloat },
      capacity: { type: GraphQLInt },
      clubId: { type: new GraphQLNonNull(GraphQLID) },
      fieldId: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(_, args, ctx) {
      const { dates, ...fields } = args;
      const { clubId, fieldId } = fields;
      const user = await ensureSessionUser(ctx);
      await Promise.all([Club.ensureExistence(clubId, { ctx }), Field.ensureExistence(fieldId, { ctx })]);
      const event = await Event.model.create({
        ...fields,
        userId: user.id,
      });
      return event;
    },
  },
});
