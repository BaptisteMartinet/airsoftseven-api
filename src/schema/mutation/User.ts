import { GraphQLID, GraphQLNonNull } from 'graphql';
import { genModelMutations } from '@sequelize-graphql/core';
import { ClientError, InvalidPermissions } from '@/utils/errors';
import { User } from '@/definitions/models';
import { ensureSessionUser } from '@/definitions/helpers/Session';
import { isUserAdmin } from '@/definitions/helpers/User';

export default genModelMutations(User, {
  fields: () => ({
    ban: {
      type: User.type,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(_, args, ctx) {
        const { id: targetUserId } = args;
        const currentUser = await ensureSessionUser(ctx);
        const currentUserAdmin = isUserAdmin(currentUser);
        if (!currentUserAdmin) throw new InvalidPermissions('Must be admin');
        const targetUser = await User.ensureExistence(targetUserId, { ctx });
        const targetUserAdmin = isUserAdmin(targetUser);
        if (targetUserAdmin) throw new InvalidPermissions('Banning admin users is not allowed');
        if (targetUser.bannedAt) throw new ClientError('UserAlreadyBanned', `User is already banned`);
        const now = new Date();
        const updatedTargetUser = await targetUser.update({ bannedAt: now });
        return updatedTargetUser;
      },
    },
  }),
});
