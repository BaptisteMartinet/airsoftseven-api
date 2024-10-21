import { GraphQLFloat, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql';
import { genModelMutations, GraphQLDate, GraphQLNonNullList } from '@sequelize-graphql/core';
import { InvalidPermissions } from '@/utils/errors';
import { ensureNotSpam } from '@/utils/model';
import { EventGamemodeTypeEnum, type EventGamemodeType } from '@definitions/enums';
import { Event, Club, Field, EventGamemode } from '@definitions/models';
import { ensureSessionUser } from '@definitions/helpers/Session';
import { genEventSlug } from '@/definitions/helpers/Event';

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
      gamemodes: { type: new GraphQLNonNullList(EventGamemodeTypeEnum.gqlType) },
      clubId: { type: new GraphQLNonNull(GraphQLID) },
      fieldId: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(_, args, ctx) {
      const { gamemodes, ...fields } = args;
      const { title, clubId, fieldId } = fields;
      const user = await ensureSessionUser(ctx);
      await ensureNotSpam(Event, user.id, { userIdColumn: 'authorId' });
      const [club, field] = await Promise.all([
        Club.ensureExistence(clubId, { ctx }),
        Field.ensureExistence(fieldId, { ctx }),
      ]);
      const event = await Event.model.create({
        ...fields,
        authorId: user.id,
        ...(await genEventSlug({
          eventTitle: title,
          clubName: club.name,
          fieldName: field.name,
        })),
      });
      if (gamemodes && gamemodes.length > 0) {
        await EventGamemode.model.bulkCreate(
          gamemodes.map((gamemode: EventGamemodeType) => ({
            type: gamemode,
            eventId: event.id,
          })),
        );
      }
      return event;
    },
  },

  delete: {
    async resolve(event, args, ctx) {
      const user = await ensureSessionUser(ctx);
      if (user.id !== event.authorId) throw new InvalidPermissions('InvalidPermissions');
      await event.destroy();
    },
  },
});
