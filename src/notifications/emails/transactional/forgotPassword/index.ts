import type { Context } from '@/context';

import texts from './texts';

export default function genEmailDetails(args: { code: string }, ctx: Context) {
  const { code } = args;
  const T = texts(ctx.language);
  return {
    subject: T.subject,
    text: T.formatText(code),
  } as const;
}
