import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';
import { genModelMutations, Model } from '@sequelize-graphql/core';
import { ensureNotSpam } from '@/utils/model';
import { ClientError } from '@/utils/errors';
import { ReportReasonEnum, ReportableResourceEnum, ReportableResource } from '@/definitions/enums';
import {
  Report,
  Club,
  ClubReport,
  Event,
  EventReport,
  Field,
  FieldReport,
  User,
  UserReport,
} from '@definitions/models';
import { ensureSessionUser } from '@/definitions/helpers/Session';

const ReportableModelObjMap: Record<
  ReportableResource,
  { model: Model<any>; reportModel: Model<any>; reportModelColumn: string }
> = {
  Club: { model: Club, reportModel: ClubReport, reportModelColumn: 'clubId' },
  Field: { model: Field, reportModel: FieldReport, reportModelColumn: 'fieldId' },
  Event: { model: Event, reportModel: EventReport, reportModelColumn: 'eventId' },
  User: { model: User, reportModel: UserReport, reportModelColumn: 'userId' },
};

export default genModelMutations(Report, {
  create: {
    args: {
      resourceId: { type: new GraphQLNonNull(GraphQLID) },
      resourceType: { type: new GraphQLNonNull(ReportableResourceEnum.gqlType) },
      reason: { type: new GraphQLNonNull(ReportReasonEnum.gqlType) },
      message: { type: GraphQLString },
    },
    async resolve(source, args, ctx) {
      const { resourceId, resourceType, reason, message } = args;
      const user = await ensureSessionUser(ctx);
      await ensureNotSpam(Report, user.id);
      const { model, reportModel, reportModelColumn } = ReportableModelObjMap[resourceType as ReportableResource];
      const instance = await model.ensureExistence(resourceId, { ctx });
      const alreadyReported = await reportModel.exists({
        where: {
          userId: user.id,
          [reportModelColumn]: instance.id,
        },
      });
      if (alreadyReported) throw new ClientError('AlreadyReport', `${resourceType}#${resourceId} already reported.`);
      const report = await Report.model.create({
        reason,
        message,
        authorId: user.id,
      });
      await reportModel.model.create({
        [reportModelColumn]: instance.id,
        reportId: report.id,
        authorId: user.id,
      });
      return report;
    },
  },
});
