import { GraphQLBoolean, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { Session, User } from '@definitions/models';
import { createSession } from '@definitions/helpers/Session';
import { hashPassword, comparePassword } from '@utils/password';
import { onUserRegister } from '@notifications/dispatchers';

export default new GraphQLObjectType({
  name: 'SessionMutation',
  fields: {
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
      type: new GraphQLNonNull(Session.type),
      args: {
        token: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve() {
        return null;
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
        return createSession(user.id);
      },
    },

    refresh: {
      type: new GraphQLNonNull(Session.type),
      args: {},
      resolve() {
        return null;
      },
    },

    logout: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve(_, args, ctx) {
        return true;
      },
    },

    // forgotPassword: {},
    // resetPassword: {},
  },
});
