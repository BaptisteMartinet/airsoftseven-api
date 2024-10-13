import { GraphQLBoolean, type GraphQLFieldConfigMap } from 'graphql';
import type { Context } from '@/context';
import { UserReport, type UserModel } from '@/definitions/models';
import { getSessionUser } from '@/definitions/helpers/Session';

export default function makeUserFields() {
  return {
    reported: {
      type: GraphQLBoolean,
      async resolve(user, args, ctx) {
        const currentUser = await getSessionUser(ctx);
        if (!currentUser) return false;
        return UserReport.exists({ where: { authorId: currentUser.id, userId: user.id } });
      },
    },
  } as const satisfies GraphQLFieldConfigMap<UserModel, Context>;
}
