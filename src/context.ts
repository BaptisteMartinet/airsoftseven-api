import type { IncomingMessage, ServerResponse } from 'http';

import { makeContext } from '@sequelize-graphql/core';
import { DefaultLanguage } from '@constants/language';
import { strToLanguage } from '@definitions/helpers/language';

export type Context = Awaited<ReturnType<typeof createContext>>;

export default async function createContext(args: { req: IncomingMessage; res: ServerResponse }) {
  const { req } = args;
  const contentLanguageHeader = req.headers['content-language'];
  const language = contentLanguageHeader ? strToLanguage(contentLanguageHeader) : DefaultLanguage;
  // TODO auth
  return {
    ...makeContext(),
    language,
  };
}
