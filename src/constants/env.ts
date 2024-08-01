import { ensureEnvInt, ensureEnvString } from '@utils/env';

export const DATABASE_URL = ensureEnvString('DATABASE_URL');
export const JWT_SECRET_KEY = ensureEnvString('JWT_SECRET_KEY');
export const COOKIES_SECRET_KEY = ensureEnvString('COOKIES_SECRET_KEY');
export const SENDGRID_API_KEY = ensureEnvString('SENDGRID_API_KEY');
export const PORT = ensureEnvInt('PORT');

export const DOMAIN = ensureEnvString('DOMAIN');

export const ENV = ensureEnvString('NODE_ENV');
export const PROD = ENV === 'production';
export const DEV = ENV === 'dev';
