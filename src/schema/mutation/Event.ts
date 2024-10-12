import { GraphQLFloat, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql';
import { genModelMutations, GraphQLDate, genSlug } from '@sequelize-graphql/core';
import { InvalidPermissions } from '@/utils/errors';
import { ensureNotSpam } from '@/utils/model';
import { Event, Club, Field } from '@definitions/models';
import { ensureSessionUser } from '@definitions/helpers/Session';

async function genEventSlug({
  eventTitle,
  clubName,
  fieldName,
}: {
  eventTitle: string;
  clubName: string;
  fieldName: string;
}) {
  const slugBase = [eventTitle, clubName, fieldName].join('-');
  return genSlug(slugBase, Event);
}

export default genModelMutations(Event, {
  create: {
    args: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      description: { type: GraphQLString },
      date: { type: new GraphQLNonNull(GraphQLDate) },
      durationDays: { type: GraphQLInt },
      price: { type: GraphQLFloat },
      capacity: { type: GraphQLInt },
      publicURL: { type: GraphQLString },
      clubId: { type: new GraphQLNonNull(GraphQLID) },
      fieldId: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(_, args, ctx) {
      const fields = args;
      const { title, clubId, fieldId } = fields;
      const user = await ensureSessionUser(ctx);
      await ensureNotSpam(Event, user.id);
      const [club, field] = await Promise.all([
        Club.ensureExistence(clubId, { ctx }),
        Field.ensureExistence(fieldId, { ctx }),
      ]);
      const event = await Event.model.create({
        ...fields,
        userId: user.id,
        ...(await genEventSlug({
          eventTitle: title,
          clubName: club.name,
          fieldName: field.name,
        })),
      });
      return event;
    },
  },

  delete: {
    async resolve(event, args, ctx) {
      const user = await ensureSessionUser(ctx);
      if (user.id !== event.userId) throw new InvalidPermissions('InvalidPermissions');
      await event.destroy();
    },
  },
});
