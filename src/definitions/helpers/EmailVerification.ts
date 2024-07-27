import { genRandomString } from '@utils/crypto';
import { Hour } from '@utils/time';
import { EmailVerificationCode } from '@definitions/models';

const VerificationCodeLength = 6;
const VerificationCodeChars = '0123456789';
export async function createVerificationCode(email: string) {
  const code = genRandomString(VerificationCodeLength, VerificationCodeChars);
  await EmailVerificationCode.model.create({
    email,
    code,
    expireAt: new Date(Date.now() + Hour),
  });
  return code;
}

export async function ensureVerificationCode(email: string, code: string) {
  const now = new Date();
  if (await EmailVerificationCode.exists({ where: { email, code, expireAt: { gt: now } } })) return true;
  throw new Error(`Invalid verification code: ${code} for email: ${email}`);
}
