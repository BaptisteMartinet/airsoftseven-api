import { GraphQLBoolean, type GraphQLFieldConfigMap } from 'graphql';
import type { Context } from '@/context';
import { FieldReport, type FieldModel } from '@/definitions/models';
import { getSessionUser } from '@/definitions/helpers/Session';

export default function makeFieldFields() {
  return {
    reported: {
      type: GraphQLBoolean,
      async resolve(field, args, ctx) {
        const user = await getSessionUser(ctx);
        if (!user) return false;
        return FieldReport.exists({ where: { authorId: user.id, fieldId: field.id } });
      },
    },
  } as const satisfies GraphQLFieldConfigMap<FieldModel, Context>;
}
