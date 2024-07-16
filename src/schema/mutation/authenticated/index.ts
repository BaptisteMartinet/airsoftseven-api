import { GraphQLObjectType } from 'graphql';
import { scopedField } from '@sequelize-graphql/core';
import club from './Club';

export default new GraphQLObjectType({
  name: 'AuthenticatedMutation',
  fields: () => ({
    club: scopedField(club),
  }),
});
