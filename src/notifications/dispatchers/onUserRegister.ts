import type { IdType } from '@sequelize-graphql/core';
import type { Context } from '@/context';

import { SupportEmail } from '@constants/emails';
import { makeRegisterSuccessUrl } from '@constants/links';
import { User } from '@definitions/models';
import { sendMail } from '@external-apis/sendGrid';
import { makeEmailVerificationToken } from '@definitions/helpers/Session';
import genEmailDetails from '@notifications/emails/transactional/user-register';

export default async function onUserRegister(userId: IdType, ctx: Context) {
  const user = await User.ensureExistence(userId);
  const { username, email } = user;
  const verifyUrl = makeRegisterSuccessUrl(makeEmailVerificationToken(userId)).href;
  const { subject, text } = genEmailDetails({ username, verifyUrl, ctx });
  await sendMail({
    from: SupportEmail,
    to: email,
    subject,
    text,
  });
}
