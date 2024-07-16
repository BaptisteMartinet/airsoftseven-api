import { GraphQLObjectType } from 'graphql';
import { scopedField } from '@sequelize-graphql/core';
import Club from './Club';
import Field from './Field';
import Event from './Event';

export default new GraphQLObjectType({
  name: 'AuthenticatedMutation',
  fields: () => ({
    club: scopedField(Club),
    field: scopedField(Field),
    event: scopedField(Event),
  }),
});
