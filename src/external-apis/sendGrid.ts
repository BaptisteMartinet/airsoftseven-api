import sgMail from '@sendgrid/mail';
import { SENDGRID_API_KEY } from '@constants/env';

sgMail.setApiKey(SENDGRID_API_KEY);

export function sendMail(args: { from: string; to: string; subject: string; text: string }) {
  return sgMail.send(args);
}
