import sgMail from '@sendgrid/mail';
import { SENDGRID_API_KEY } from '@constants/env';

sgMail.setApiKey(SENDGRID_API_KEY);

export default sgMail;
