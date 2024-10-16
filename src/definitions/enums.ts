import { ENUM } from '@sequelize-graphql/core';

export enum Language {
  French = 'French',
  English = 'English',
}

export const LanguageEnum = ENUM({
  name: 'Language',
  values: Language,
});

export enum ReportReason {
  Duplicate = 'Duplicate',
  Offensive = 'Offensive',
  Other = 'Other',
}

export const ReportReasonEnum = ENUM({
  name: 'ReportReason',
  values: ReportReason,
});

export enum ReportableResource {
  User = 'User',
  Club = 'Club',
  Field = 'Field',
  Event = 'Event',
}

export const ReportableResourceEnum = ENUM({
  name: 'ReportableResource',
  values: ReportableResource,
});
