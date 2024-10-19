import sgMail from '@sendgrid/mail';
import { __SENDGRID_API_KEY__ } from '@constants/env';

sgMail.setApiKey(__SENDGRID_API_KEY__);

export function sendMail(args: { from: string; to: string; subject: string; text: string }) {
  return sgMail.send(args);
}
