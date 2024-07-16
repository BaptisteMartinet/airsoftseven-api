import { GraphQLObjectType } from 'graphql';
import { scopedField } from '@sequelize-graphql/core';
import Club from './Club';
import Field from './Field';

export default new GraphQLObjectType({
  name: 'AuthenticatedMutation',
  fields: () => ({
    club: scopedField(Club),
    field: scopedField(Field),
  }),
});
