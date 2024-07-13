import { printSchema } from 'graphql';
import schema from '@schema/index';

process.stdout.write(printSchema(schema));
