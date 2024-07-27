import type { Context } from '@/context';

import { GraphQLBoolean, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { addMonths, differenceInMilliseconds } from 'date-fns';
import { hashPassword, comparePassword } from '@utils/password';
import { signJWT } from '@utils/jwt';
import { Session, User } from '@definitions/models';
import { createSession, ensureSession, ensureSessionFromToken } from '@definitions/helpers/Session';
import { createVerificationCode, ensureVerificationCode } from '@definitions/helpers/EmailVerification';
import { onVerifyEmail } from '@notifications/dispatchers';

export default new GraphQLObjectType<unknown, Context>({
  name: 'SessionMutation',
  fields: () => ({
    verifyEmail: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, args, ctx) {
        const { email } = args;
        const code = await createVerificationCode(email);
        await onVerifyEmail({ email, code }, ctx);
        return true;
      },
    },

    register: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        code: { type: new GraphQLNonNull(GraphQLString) },
        username: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        newsletterOptIn: { type: GraphQLBoolean },
      },
      async resolve(_, args, ctx) {
        const { code, username, email, password, newsletterOptIn } = args;
        await ensureVerificationCode(email, code);
        if (await User.exists({ where: { email } })) throw new Error('Email already taken'); // TODO custom error
        if (await User.exists({ where: { username } })) throw new Error('Username already taken'); // TODO custom error
        const passwordHash = hashPassword(password);
        await User.model.create({
          username,
          email,
          passwordHash,
          newsletterOptIn,
        });
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
        const user = await User.model.findOne({ where: { email } });
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
        const session = await ensureSession(ctx);
        await session.update({ closedAt: new Date() });
        return true;
      },
    },

    // forgotPassword: {},
    // resetPassword: {},
  }),
});
