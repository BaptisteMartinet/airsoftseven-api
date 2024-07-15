export const AirsoftSevenUrl = 'https://airsoftseven.com';

export const makeRegisterSuccessUrl = (token: string) => new URL(`registerSuccess/${token}`, AirsoftSevenUrl);
