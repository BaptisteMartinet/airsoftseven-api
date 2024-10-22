import { Op } from 'sequelize';
import { genRandomString } from '@utils/crypto';
import { EmailVerificationCode } from '@definitions/models';
import { EmailVerificationCodeType } from '@definitions/enums';

const VerificationCodeChars = '0123456789';

export async function createVerificationCode(args: {
  email: string;
  type: EmailVerificationCodeType;
  len: number;
  expireInMs: number;
}) {
  const { email, type, len, expireInMs } = args;
  const code = genRandomString(len, VerificationCodeChars);
  const expiredAt = new Date(Date.now() + expireInMs);
  await EmailVerificationCode.model.create({
    email,
    code,
    type,
    expiredAt,
  });
  return code;
}

export async function ensureVerificationCode(args: { email: string; code: string; type: EmailVerificationCodeType }) {
  const { email, code, type } = args;
  const now = new Date();
  const codeExists = await EmailVerificationCode.exists({ where: { email, code, type, expiredAt: { [Op.gt]: now } } });
  if (codeExists) return;
  throw new Error(`Invalid verification code: ${code} for email: ${email}`);
}
