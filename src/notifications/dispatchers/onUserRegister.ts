import type { IdType } from '@sequelize-graphql/core';
import type { Context } from '@/context';

import sgMail from '@external-apis/sendGrid';
import { SupportEmail } from '@constants/emails';
import { makeRegisterSuccessUrl } from '@constants/links';
import { User } from '@definitions/models';
import { makeEmailVerificationToken } from '@definitions/helpers/Session';
import render from '@notifications/emails/transactional/user-register';
import texts from '@notifications/emails/transactional/user-register/texts';

export default async function onUserRegister(userId: IdType, ctx: Context) {
  const user = await User.ensureExistence(userId);
  const { username, email } = user;
  const subject = texts(ctx.language).subject;
  const verifyUrl = makeRegisterSuccessUrl(makeEmailVerificationToken(userId)).href;
  await sgMail.send({
    from: SupportEmail,
    to: email,
    subject: subject,
    html: render({
      username,
      verifyUrl,
      ctx,
    }),
  });
}
