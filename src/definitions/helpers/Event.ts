import { genSlug } from '@sequelize-graphql/core';
import { Event } from '@definitions/models';

export async function genEventSlug({
  eventTitle,
  clubName,
  fieldName,
}: {
  eventTitle: string;
  clubName: string;
  fieldName: string;
}) {
  const slugBase = [eventTitle, clubName, fieldName].join('-');
  return genSlug(slugBase, Event);
}
