import type { Model } from '@sequelize-graphql/core';
import db from '@db/index';
import * as RawModels from '@definitions/models';

// A very simple syncModels implementation
async function syncModels(models: Array<Model<any>>) {
  await db.authenticate();
  console.info('DB authenticated');
  for (const model of models) {
    model.associations;
    await model.model.sync();
  }
  console.info(`Synced ${models.length} models.`);
}

async function main() {
  await syncModels(Object.values(RawModels));
}

main().catch(console.error);
