import { GraphQLObjectType } from 'graphql';
import { Session } from '@definitions/models';
import { ensureSessionUser } from '@/definitions/helpers/Session';

export default new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    session: {
      type: Session.type,
      async resolve(_, args, ctx) {
        try {
          return ensureSessionUser(ctx);
        } catch (e) {
          return null;
        }
      },
    },
  }),
});
