import { GraphQLBoolean, type GraphQLFieldConfigMap } from 'graphql';
import type { Context } from '@/context';
import { EventInterest, EventReport, type EventModel } from '@/definitions/models';
import { getSessionUser } from '@/definitions/helpers/Session';

export default function makeEventFields() {
  return {
    reported: {
      type: GraphQLBoolean,
      async resolve(event, args, ctx) {
        const user = await getSessionUser(ctx);
        if (!user) return false;
        return EventReport.exists({ where: { authorId: user.id, eventId: event.id } });
      },
    },
    interested: {
      type: GraphQLBoolean,
      async resolve(event, args, ctx) {
        const user = await getSessionUser(ctx);
        if (!user) return false;
        return EventInterest.exists({ where: { userId: user.id, eventId: event.id } });
      },
    },
  } as const satisfies GraphQLFieldConfigMap<EventModel, Context>;
}
