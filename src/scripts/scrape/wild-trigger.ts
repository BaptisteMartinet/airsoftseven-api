import '@scripts/common/prevent-circular-imports';

import assert from 'assert';
import * as cheerio from 'cheerio';
import { differenceInDays } from 'date-fns';
import { makeContext, type IdType } from '@sequelize-graphql/core';
import { sleep, Second } from '@/utils/time';
import { makeArrayUniq } from '@/utils/array';
import { Club, Event, Field, User } from '@/definitions/models';
import { genEventSlug } from '@/definitions/helpers/Event';
import { runWithDBAndHandleErrors } from '@scripts/common';

const WildTriggerFieldsBaseURL = 'https://wildtrigger.com/categorie-produit/terrain';
const SleepDelayBetweenPagesMs = 1 * Second;
const BaptisteId = '120e6d2e-dae5-4cdd-b68d-4a0f2c90f1d8'; // TODO change
const WildTriggerClubId = '96e4eed5-37a4-4f29-85d1-e34277a50ca8'; // TODO change

// TODO update values
const FieldsInfoPerFieldName = new Map<string, { id: IdType; capacity: number }>([
  ['agency', { id: '6526deb3-34bb-4052-ae8e-711c7b348a0e', capacity: 60 }],
  ['nordisk', { id: '0d015900-38f5-4728-9de3-d26dbbfcafdb', capacity: 60 }],
  ['territory', { id: '9a9c26bf-821c-41ca-8a03-6cadc8b34c5c', capacity: 60 }],
  ['new agency', { id: 'c4d56819-79a2-4d86-ac5a-c68cc2270e97', capacity: 60 }],
  ['domain', { id: 'ca40c1da-0357-4f89-abc4-59ab9dad5f87', capacity: 60 }],
  ['mosaïc', { id: '9ebb747f-6b65-450a-9378-520a1f51c80c', capacity: 60 }],
  ['complex', { id: '9b41b315-d9c5-42ed-b1f4-fbc58fc019b6', capacity: 60 }],
  ['virgo', { id: 'babde254-a306-4ea2-8014-59a93687dac6', capacity: 60 }],
]);

function makeEventsPageURL(pageNum: number) {
  return WildTriggerFieldsBaseURL + `/page/${pageNum}`;
}

type EventT = Awaited<ReturnType<typeof scrapePage>>[number];

async function scrapePage(url: string) {
  const page = await cheerio.fromURL(url);
  const data = page.extract({
    products: [
      {
        selector: '.products li',
        value: {
          publicURL: {
            selector: 'a',
            value: 'href',
          },
          date: {
            selector: '.event-date',
          },
          title: {
            selector: '.woocommerce-loop-product__title',
          },
          fieldName: {
            selector: '.ast-woo-product-category',
          },
          price: {
            selector: 'bdi',
          },
        },
      },
    ],
  });
  return data.products;
}

async function scrapePages() {
  const events: Array<EventT> = [];
  let pageNum = 1;
  let running = true;

  while (running) {
    const url = makeEventsPageURL(pageNum);
    try {
      const pageEvents = await scrapePage(url);
      events.push(...pageEvents);
      console.info(`Scraped ${pageEvents.length} events on page ${pageNum}. ${events.length} in total.`);
      await sleep(SleepDelayBetweenPagesMs);
      pageNum += 1;
    } catch (err) {
      running = false;
      console.info(`Stop reason: ${err}`);
    }
  }
  return events;
}

function parseRawEventFieldName(rawFielName: string) {
  return rawFielName.trim().toLowerCase();
}

function parseRawEventDate(rawDate: string) {
  const [day_, month_, year_] = rawDate.split('/');
  const day = parseInt(day_);
  const month = parseInt(month_) - 1;
  const year = parseInt(year_);
  assert(!isNaN(day) && !isNaN(month) && !isNaN(year), `Invalid date: ${rawDate}`);
  return new Date(year, month, day);
}

function parseRawEventDateAndDuration(rawDate: string) {
  const dates = rawDate.split(' - ');
  if (dates.length === 1) {
    return {
      date: parseRawEventDate(dates[0]),
      durationDays: 1,
    };
  }
  if (dates.length === 2) {
    const startDate = parseRawEventDate(dates[0]);
    const endDate = parseRawEventDate(dates[1]);
    const daysDiff = differenceInDays(endDate, startDate);
    return { date: startDate, durationDays: daysDiff };
  }
  throw new Error(`Invalid date format: ${rawDate}`);
}

function parseRawEventPrice(rawPrice: string) {
  const [price_] = rawPrice.split(' ');
  const price = parseFloat(price_);
  assert(!isNaN(price), `Invalid price: ${rawPrice}`);
  return price;
}

function parseRawEvent(event: EventT) {
  const { fieldName: rawFieldName, title, date: rawDate, price: rawPrice, publicURL } = event;
  assert(rawFieldName && title && rawDate && rawPrice && publicURL, `Invalid event data: ${JSON.stringify(event)}`);
  const { date, durationDays } = parseRawEventDateAndDuration(rawDate);
  const price = parseRawEventPrice(rawPrice);
  const fieldName = parseRawEventFieldName(rawFieldName);
  return {
    title,
    date,
    durationDays,
    price,
    publicURL,
    fieldName,
  };
}

async function createEvents(rawEvents: Array<EventT>) {
  const ctx = makeContext();
  const user = await User.ensureExistence(BaptisteId, { ctx });
  const club = await Club.ensureExistence(WildTriggerClubId, { ctx });
  const now = new Date();
  const dateTzOffset = now.getTimezoneOffset();

  const unknownFieldNames: Array<string> = [];
  let existingEventsCount = 0;
  let createdEventsCount = 0;

  for (const rawEvent of rawEvents) {
    const { title, date, durationDays, price, publicURL, fieldName } = parseRawEvent(rawEvent);
    const fieldInfo = FieldsInfoPerFieldName.get(fieldName);
    if (!fieldInfo) {
      unknownFieldNames.push(fieldName);
      continue;
    }
    const { id: fieldId, capacity } = fieldInfo;
    const field = await Field.ensureExistence(fieldId, { ctx });

    // TODO improve this to not use publicURL (using event date?)
    const eventAlreadyExists = await Event.exists({
      where: {
        publicURL,
        clubId: club.id,
        fieldId: field.id,
      },
    });
    if (eventAlreadyExists) {
      existingEventsCount += 1;
      continue;
    }

    const { slug, slugBase } = await genEventSlug({
      eventTitle: title,
      clubName: club.name,
      fieldName: field.name,
    });

    await Event.model.create({
      slug,
      slugBase,
      title,
      date,
      dateTzOffset,
      durationDays,
      price,
      capacity,
      publicURL,
      authorId: user.id,
      clubId: club.id,
      fieldId: fieldId,
    });
    createdEventsCount += 1;
  }
  console.info(' ');
  console.info(`${rawEvents.length} found.`);
  console.info(`${createdEventsCount} created.`);
  console.info(`${existingEventsCount + unknownFieldNames.length} ignored.`);
  console.info(`- ${existingEventsCount} already existing.`);
  console.info(`- ${unknownFieldNames.length} with unknown fields (${makeArrayUniq(unknownFieldNames).join(', ')}).`);
}

async function main() {
  const events = await scrapePages();
  await createEvents(events);
  console.info('Done');
}

runWithDBAndHandleErrors(main);
