import { GraphQLObjectType } from 'graphql';
import { scopedField } from '@sequelize-graphql/core';
import session from './session';
import Club from './Club';
import Field from './Field';
import Event from './Event';
import Report from './Report';

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    session: scopedField(session),
    club: scopedField(Club),
    field: scopedField(Field),
    event: scopedField(Event),
    report: scopedField(Report),
  },
});
