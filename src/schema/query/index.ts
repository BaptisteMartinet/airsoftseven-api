import { GraphQLObjectType } from 'graphql';
import { Session } from '@definitions/models';
import { ensureSession } from '@/definitions/helpers/Session';

export default new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    session: {
      type: Session.type,
      async resolve(_, args, ctx) {
        try {
          return await ensureSession(ctx);
        } catch (e) {
          return null;
        }
      },
    },
  }),
});
