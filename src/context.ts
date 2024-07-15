import type { IncomingMessage, ServerResponse } from 'http';

import { makeContext } from '@sequelize-graphql/core';
import { DefaultLanguage } from '@constants/language';
import { strToLanguage } from '@definitions/helpers/language';

export type Context = Awaited<ReturnType<typeof createContext>>;

export default async function createContext(args: { req: IncomingMessage; res: ServerResponse }) {
  const { req, res } = args;
  const contentLanguageHeader = req.headers['content-language'];
  const language = contentLanguageHeader ? strToLanguage(contentLanguageHeader) : DefaultLanguage;
  const token = req.headers.authorization ?? null;
  return {
    ...makeContext(),
    req,
    res,
    language,
    token,
  };
}
