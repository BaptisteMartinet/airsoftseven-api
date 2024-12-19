import type { Request, Response } from 'express';
import type { Context as ContextBase, IdType } from '@sequelize-graphql/core';
import type { Language } from '@definitions/enums';

import { makeContext } from '@sequelize-graphql/core';
import { DefaultLanguage } from '@constants/language';
import { ensureStrLanguage } from '@definitions/helpers/language';

export interface Context extends ContextBase {
  req: Request;
  res: Response;
  language: Language;
  sessionId: IdType | null;
}

export default async function createContext(args: { req: Request; res: Response }): Promise<Context> {
  const { req, res } = args;
  const languageCookie = req.cookies.locale;
  const language = languageCookie ? ensureStrLanguage(languageCookie) : DefaultLanguage;
  const sessionId = req.signedCookies.session;
  return {
    ...makeContext(),
    req,
    res,
    language,
    sessionId,
  };
}
