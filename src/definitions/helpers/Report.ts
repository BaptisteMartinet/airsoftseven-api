import { type GraphQLFieldConfig, GraphQLNonNull, GraphQLID, GraphQLString } from 'graphql';
import { Model } from '@sequelize-graphql/core';
import { ensureNotSpam } from '@/utils/model';
import type { Context } from '@/context';
import { ReportReasonEnum } from '@definitions/enums';
import { Report } from '@definitions/models';
import { ensureSessionUser } from './Session';

export function makeReportFieldConfig(model: Model<any>, reportModel: Model<any>, reportModelKey: string) {
  return {
    type: model.type,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      reason: { type: new GraphQLNonNull(ReportReasonEnum.gqlType) },
      message: { type: GraphQLString },
    },
    async resolve(_, args, ctx) {
      const { id, reason, message } = args;
      const user = await ensureSessionUser(ctx);
      await ensureNotSpam(Report, user.id);
      const instance = await model.ensureExistence(id, { ctx });
      const report = await Report.model.create({
        reason,
        message,
        userId: user.id,
      });
      await reportModel.model.create({
        [reportModelKey]: instance.id,
        reportId: report.id,
      });
      return instance;
    },
  } as const satisfies GraphQLFieldConfig<any, Context>;
}
