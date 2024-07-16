import { GraphQLObjectType } from 'graphql';
import { scopedField } from '@sequelize-graphql/core';
import session from './session';
import authenticated from './authenticated';

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    session: scopedField(session),
    authenticated: scopedField(authenticated),
  },
});
