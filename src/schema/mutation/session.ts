import type { Context } from '@/context';

import { GraphQLBoolean, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { genSlug } from '@sequelize-graphql/core';
import { hashPassword, comparePassword } from '@utils/password';
import { UserBanned } from '@/utils/errors';
import { Hour, Minute } from '@/utils/time';
import { Session, User } from '@definitions/models';
import { EmailVerificationCodeType } from '@definitions/enums';
import {
  closeAllSessions,
  closeSession,
  createSession,
  ensureSession,
  setSessionCookie,
} from '@definitions/helpers/Session';
import { createVerificationCode, ensureVerificationCode } from '@definitions/helpers/EmailVerification';
import { onVerifyEmail, onForgotPassword } from '@notifications/dispatchers';

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
        const code = await createVerificationCode({
          email,
          type: EmailVerificationCodeType.Register,
          len: 6,
          expireInMs: 1 * Hour,
        });
        await onVerifyEmail({ email, code }, ctx);
        return true;
      },
    },

    register: {
      type: new GraphQLNonNull(Session.type),
      args: {
        code: { type: new GraphQLNonNull(GraphQLString) },
        username: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        newsletterOptIn: { type: GraphQLBoolean },
      },
      async resolve(_, args, ctx) {
        const { code, username, email, password, newsletterOptIn } = args;
        await ensureVerificationCode({ email, code, type: EmailVerificationCodeType.Register });
        if (await User.exists({ where: { email } })) throw new Error('Email already taken'); // TODO custom error
        const passwordHash = hashPassword(password);
        const user = await User.model.create({
          username,
          email,
          passwordHash,
          newsletterOptIn,
          ...(await genSlug(username, User)),
        });
        const session = await createSession(user);
        setSessionCookie(session, ctx);
        return session;
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
        if (user.bannedAt) throw new UserBanned();

        const session = await createSession(user);
        setSessionCookie(session, ctx);
        return session;
      },
    },

    logout: {
      type: new GraphQLNonNull(GraphQLBoolean),
      async resolve(_, args, ctx) {
        const session = await ensureSession(ctx);
        await closeSession(session, ctx);
        return true;
      },
    },

    forgotPassword: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, args, ctx) {
        const { email } = args;
        const userExists = await User.exists({ where: { email } });
        if (!userExists) return true;
        const code = await createVerificationCode({
          email,
          type: EmailVerificationCodeType.ResetPassword,
          len: 12,
          expireInMs: 15 * Minute,
        });
        await onForgotPassword({ email, code }, ctx);
        return true;
      },
    },

    resetPassword: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        code: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        newPassword: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, args, ctx) {
        const { code, email, newPassword } = args;
        await ensureVerificationCode({ email, code, type: EmailVerificationCodeType.ResetPassword });
        const passwordHash = hashPassword(newPassword);
        const user = await User.model.findOne({ where: { email } });
        if (!user) return true;
        await user.update({ passwordHash });
        await closeAllSessions(user.id);
        return true;
      },
    },
  }),
});
