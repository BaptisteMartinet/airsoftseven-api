import type { Context } from '@/context';

import { SupportEmail } from '@constants/emails';
import { sendMail } from '@external-apis/sendGrid';
import genEmailDetails from '@notifications/emails/transactional/forgotPassword';

export default async function onForgotPassword(args: { email: string; code: string }, ctx: Context) {
  const { email, code } = args;
  const { subject, text } = genEmailDetails({ code }, ctx);
  await sendMail({
    from: SupportEmail,
    to: email,
    subject,
    text,
  });
}
