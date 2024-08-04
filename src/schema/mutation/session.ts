import type { Context } from '@/context';

import { GraphQLBoolean, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { differenceInMilliseconds } from 'date-fns';
import { hashPassword, comparePassword } from '@utils/password';
import { Day } from '@utils/time';
import { PROD, DOMAIN } from '@constants/env';
import { Session, User } from '@definitions/models';
import { ensureSession } from '@definitions/helpers/Session';
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
        const expireAt = new Date(now.getTime() + Day * 30);
        const session = await Session.model.create({
          userId: user.id,
          expireAt,
        });
        const maxAge = differenceInMilliseconds(expireAt, now);
        ctx.res.cookie('session', session.id, {
          maxAge,
          httpOnly: true,
          secure: PROD,
          signed: true,
          sameSite: 'lax',
          path: '/',
          domain: PROD ? `.${DOMAIN}` : '',
        });
        return session;
      },
    },

    logout: {
      type: new GraphQLNonNull(GraphQLBoolean),
      async resolve(_, args, ctx) {
        const session = await ensureSession(ctx);
        await session.update({ closedAt: new Date() });
        ctx.res.clearCookie('session');
        return true;
      },
    },

    // forgotPassword: {},
    // resetPassword: {},
  }),
});
