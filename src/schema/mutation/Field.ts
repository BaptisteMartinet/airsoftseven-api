import { GraphQLFloat, GraphQLNonNull, GraphQLString } from 'graphql';
import { genModelMutations, genSlug, GraphQLNonNullList } from '@sequelize-graphql/core';
import { ClientError, InvalidPermissions } from '@/utils/errors';
import { ensureNotSpam } from '@/utils/model';
import { Field, Event, FieldPlaygroundType } from '@definitions/models';
import { PlaygroundTypeEnum, PlaygroundType } from '@/definitions/enums';
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
      playgroundTypes: { type: new GraphQLNonNullList(PlaygroundTypeEnum.gqlType) },
    },
    async resolve(_, args, ctx) {
      const { playgroundTypes, ...fields } = args;
      const { name } = fields;
      const user = await ensureSessionUser(ctx);
      await ensureNotSpam(Field, user.id, { userIdColumn: 'authorId' });
      const field = await Field.model.create({
        ...fields,
        authorId: user.id,
        ...(await genSlug(name, Field)),
      });
      if (playgroundTypes.length > 0) {
        await FieldPlaygroundType.model.bulkCreate(
          playgroundTypes.map((playgroundType: PlaygroundType) => ({
            fieldId: field.id,
            type: playgroundType,
          })),
        );
      }
      return field;
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
