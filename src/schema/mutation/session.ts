import type { Context } from '@/context';

import { GraphQLBoolean, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { addMonths, differenceInMilliseconds } from 'date-fns';
import { Session, User } from '@definitions/models';
import { createSession, ensureEmailVerificationTokenPayload } from '@definitions/helpers/Session';
import { hashPassword, comparePassword } from '@utils/password';
import { onUserRegister } from '@notifications/dispatchers';

export default new GraphQLObjectType<unknown, Context>({
  name: 'SessionMutation',
  fields: () => ({
    register: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, args, ctx) {
        const { username, email, password } = args;
        if (await User.exists({ where: { email } })) throw new Error('Email already taken'); // TODO custom error
        if (await User.exists({ where: { username } })) throw new Error('Username already taken'); // TODO custom error
        const passwordHash = hashPassword(password);
        const user = await User.model.create({
          username,
          email,
          passwordHash,
        });
        await onUserRegister(user.id, ctx);
        return true;
      },
    },

    verifyAccount: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        token: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, args, ctx) {
        const { token } = args;
        const userId = ensureEmailVerificationTokenPayload(token);
        const user = await User.ensureExistence(userId, { ctx });
        await user.update({ emailVerified: true });
        return true;
      },
    },

    login: {
      type: new GraphQLNonNull(Session.type),
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, args, ctx) {
        const { email, password } = args;
        const user = await User.model.findOne({ where: { email, emailVerified: true } });
        if (user === null) throw new Error('Email or password is invalid'); // TODO custom error
        if (!comparePassword(password, user.passwordHash)) throw new Error('Email or password is invalid'); // TODO custom error
        const now = new Date();
        const expireAt = addMonths(now, 3);
        const session = await createSession(user.id, { now, expireAt });
        const maxAge = differenceInMilliseconds(expireAt, now);
        ctx.res.cookie('refreshToken', session.refreshToken, {
          maxAge,
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        });
        return session;
      },
    },

    // refresh: {
    //   type: new GraphQLNonNull(Session.type),
    //   resolve(_, args, ctx) {
    //     // todo
    //     return null;
    //   },
    // },

    // logout: {
    //   type: new GraphQLNonNull(GraphQLBoolean),
    //   args: {},
    //   resolve(_, args, ctx) {
    //     return true;
    //   },
    // },

    // forgotPassword: {},
    // resetPassword: {},
  }),
});
