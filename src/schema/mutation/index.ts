import { GraphQLObjectType } from 'graphql';
import { scopedField } from '@sequelize-graphql/core';
import session from './session';

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    session: scopedField(session),
  },
});
