import type { Context } from '@/context';

import { GraphQLBoolean, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { addMonths, differenceInMilliseconds } from 'date-fns';
import { hashPassword, comparePassword } from '@utils/password';
import { signJWT } from '@utils/jwt';
import { Session, User } from '@definitions/models';
import {
  createSession,
  ensureEmailVerificationTokenPayload,
  ensureSessionFromToken,
} from '@definitions/helpers/Session';
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
        if (user.emailVerified) throw new Error('Email already verified');
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
        const passwordMatch = comparePassword(password, user?.passwordHash ?? '') && user !== null;
        if (!passwordMatch) throw new Error('Email or password is invalid'); // TODO custom error
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

    refresh: {
      type: new GraphQLNonNull(Session.type),
      async resolve(_, args, ctx) {
        const { token } = ctx;
        const { refreshToken } = ctx.req.cookies;
        if (!token || !refreshToken) throw new Error('Unable to refresh session');
        const session = await ensureSessionFromToken(refreshToken);
        if (session.token !== token || session.refreshToken !== refreshToken) throw new Error('Tokens do not match');
        const newToken = signJWT({ sessionId: session.id }, { expiresIn: '5m' });
        return session.update({ token: newToken });
      },
    },

    logout: {
      type: new GraphQLNonNull(GraphQLBoolean),
      async resolve(_, args, ctx) {
        const { token } = ctx;
        if (!token) throw new Error('Invalid token');
        const session = await ensureSessionFromToken(token);
        await session.update({ closedAt: new Date() });
        return true;
      },
    },

    // forgotPassword: {},
    // resetPassword: {},
  }),
});
