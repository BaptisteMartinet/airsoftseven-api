import { ensureEnvInt, ensureEnvString } from '@utils/env';

export const __DATABASE_URL__ = ensureEnvString('DATABASE_URL');
export const __JWT_SECRET_KEY__ = ensureEnvString('JWT_SECRET_KEY');
export const __COOKIES_SECRET_KEY__ = ensureEnvString('COOKIES_SECRET_KEY');
export const __SENDGRID_API_KEY__ = ensureEnvString('SENDGRID_API_KEY');
export const __PORT__ = ensureEnvInt('PORT');

export const __DOMAIN__ = ensureEnvString('DOMAIN');
export const __DOMAIN_FULL__ = `https://${__DOMAIN__}`;

export const __ENV__ = ensureEnvString('NODE_ENV');
export const __PROD__ = __ENV__ === 'production';
export const __DEV__ = __ENV__ === 'dev';
