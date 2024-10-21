import { Op } from 'sequelize';
import { genRandomString } from '@utils/crypto';
import { EmailVerificationCode } from '@definitions/models';

const VerificationCodeChars = '0123456789';

export async function createVerificationCode(args: { email: string; len: number; expireInMs: number }) {
  const { email, len, expireInMs } = args;
  const code = genRandomString(len, VerificationCodeChars);
  const expiredAt = new Date(Date.now() + expireInMs);
  await EmailVerificationCode.model.create({
    email,
    code,
    expiredAt,
  });
  return code;
}

export async function ensureVerificationCode(email: string, code: string) {
  const now = new Date();
  const codeExists = await EmailVerificationCode.exists({ where: { email, code, expiredAt: { [Op.gt]: now } } });
  if (codeExists) return;
  throw new Error(`Invalid verification code: ${code} for email: ${email}`);
}
