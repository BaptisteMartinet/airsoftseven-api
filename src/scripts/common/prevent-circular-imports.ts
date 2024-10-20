import * as RawModels from '@definitions/models';

for (const model of Object.values(RawModels)) model.associations;
