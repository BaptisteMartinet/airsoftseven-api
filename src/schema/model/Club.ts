import { GraphQLBoolean, type GraphQLFieldConfigMap } from 'graphql';
import type { Context } from '@/context';
import { ClubReport, type ClubModel } from '@/definitions/models';
import { getSessionUser } from '@/definitions/helpers/Session';

export default function makeClubFields() {
  return {
    reported: {
      type: GraphQLBoolean,
      async resolve(club, args, ctx) {
        const user = await getSessionUser(ctx);
        if (!user) return false;
        return ClubReport.exists({ where: { authorId: user.id, clubId: club.id } });
      },
    },
  } as const satisfies GraphQLFieldConfigMap<ClubModel, Context>;
}
