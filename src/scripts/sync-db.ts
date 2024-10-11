import type { Model } from '@sequelize-graphql/core';
import db from '@db/index';
import * as RawModels from '@definitions/models';

function parseArgs(args: Array<string>) {
  const [node, path, ...restArgs] = args;
  return new Set(restArgs);
}

// A very simple syncModels implementation
async function syncModels(models: Array<Model<any>>) {
  const args = parseArgs(process.argv);
  await db.authenticate();
  console.info('DB authenticated');
  const force = args.has('--force');
  const alter = args.has('--alter');
  for (const model of models) {
    model.associations;
    await model.model.sync({ force, alter });
  }
  console.info(`Synced ${models.length} models.`);
}

async function main() {
  await syncModels(Object.values(RawModels));
}

main().catch(console.error);
