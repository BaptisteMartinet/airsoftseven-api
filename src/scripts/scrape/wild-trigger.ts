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
const SleepDelayBetweenDetailsPagesMs = 1 * Second;
const BaptisteId = '989cd57f-c6ab-4c60-9a3e-f4bc00ee4204';
const WildTriggerClubId = '6f2358d3-edfa-4ad7-9950-e88802a100ba';

const FieldsInfoPerFieldName = new Map<string, { id: IdType; capacity: number }>([
  ['agency', { id: 'b914a176-7ae1-4d7c-9f12-215eca643325', capacity: 60 }],
  ['nordisk', { id: 'f12f9cad-6ee7-4531-8d28-871301547c99', capacity: 40 }],
  ['territory', { id: 'da46fe37-364b-4296-b19d-49f60cc3abcc', capacity: 24 }],
  ['new agency', { id: '00d419cb-665b-46ec-916a-8bf9b5aae7c6', capacity: 240 }],
  ['domain', { id: '7f9c1807-8002-4d4d-b83c-bb9e4ddb80ed', capacity: 150 }],
  ['mosaïc', { id: 'd134b7b4-8911-458b-a9ec-5e4aa672edd7', capacity: 50 }],
  ['complex', { id: '37c4a228-3c3b-4732-959d-035510abd66f', capacity: 150 }],
  ['virgo', { id: '3db08536-548a-49f5-81e1-80ed39f1954f', capacity: 60 }],
  ['cercle', { id: '60c1afa3-4d53-40c1-b8ae-b9641fc038db', capacity: 40 }],
]);

function makeEventsPageURL(pageNum: number) {
  return WildTriggerFieldsBaseURL + `/page/${pageNum}`;
}

interface ParsedEvent {
  title: string;
  date: Date;
  durationDays: number;
  price: number;
  publicURL: string;
  // Details
  fieldName: string;
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

async function scrapeEventPageDetails(url: string) {
  const page = await cheerio.fromURL(url);
  const data = page.extract({
    fieldName: '.woocommerce-breadcrumb > a:nth-of-type(3)',
  });
  return data;
}

async function scrapeEventsPage(url: string) {
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
          price: {
            selector: 'bdi',
          },
        },
      },
    ],
  });
  const events: Array<ParsedEvent> = [];
  for (const rawEvent of data.products) {
    const { publicURL, date: rawDate, title, price: rawPrice } = rawEvent;
    assert(title && rawDate && rawPrice && publicURL, `Invalid event data: ${JSON.stringify(rawEvent)}`);
    const { date, durationDays } = parseRawEventDateAndDuration(rawDate);
    const price = parseRawEventPrice(rawPrice);
    const details = await scrapeEventPageDetails(publicURL);
    const { fieldName: rawFieldName } = details;
    if (!rawFieldName) {
      console.info(`Ignoring event ${title} because details are not available: ${publicURL}`);
      continue;
    }
    const fieldName = parseRawEventFieldName(rawFieldName);
    events.push({
      title,
      date,
      durationDays,
      price,
      publicURL,
      // details
      fieldName,
    });
    await sleep(SleepDelayBetweenDetailsPagesMs);
  }
  return events;
}

async function scrapeEventsPages() {
  let events: Array<ParsedEvent> = [];
  let pageNum = 1;
  let running = true;

  while (running) {
    const url = makeEventsPageURL(pageNum);
    try {
      const pageEvents = await scrapeEventsPage(url);
      events = events.concat(pageEvents);
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

async function createEvents(events: Array<ParsedEvent>) {
  const ctx = makeContext();
  const user = await User.ensureExistence(BaptisteId, { ctx });
  const club = await Club.ensureExistence(WildTriggerClubId, { ctx });

  const unknownFieldNames: Array<string> = [];
  let existingEventsCount = 0;
  let createdEventsCount = 0;

  for (const event of events) {
    const { fieldName, title, date, durationDays, price, publicURL } = event;
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
      dateTzOffset: date.getTimezoneOffset(),
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
  console.info(`${events.length} found.`);
  console.info(`${createdEventsCount} created.`);
  console.info(`${existingEventsCount + unknownFieldNames.length} ignored.`);
  console.info(`- ${existingEventsCount} already existing.`);
  console.info(`- ${unknownFieldNames.length} with unknown fields (${makeArrayUniq(unknownFieldNames).join(', ')}).`);
}

async function main() {
  const events = await scrapeEventsPages();
  await createEvents(events);
  console.info('Done');
}

runWithDBAndHandleErrors(main);
