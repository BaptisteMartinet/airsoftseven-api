import type { Context } from '@/context';

import texts from './texts';

export default function genEmailDetails(args: { username: string; verifyUrl: string; ctx: Context }) {
  const { username, verifyUrl, ctx } = args;
  const T = texts(ctx.language);
  return {
    subject: T.subject,
    text: T.formatText({ username, link: verifyUrl }),
  } as const;
}
