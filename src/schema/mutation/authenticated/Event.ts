import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';
import { genModelMutations, GraphlQLDate } from '@sequelize-graphql/core';
import { Club, Event, Field } from '@definitions/models';
import { ensureSessionUser } from '@definitions/helpers/Session';

export default genModelMutations(Event, {
  prefix: 'Authenticated',
  create: {
    args: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      date: { type: new GraphQLNonNull(GraphlQLDate) },
      clubId: { type: new GraphQLNonNull(GraphQLID) },
      fieldId: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(_, args, ctx) {
      const { title, date, clubId, fieldId } = args;
      const user = await ensureSessionUser(ctx);
      await Promise.all([Club.ensureExistence(clubId, { ctx }), Field.ensureExistence(fieldId, { ctx })]);
      return Event.model.create({ title, date, clubId, fieldId, userId: user.id });
    },
  },
});
