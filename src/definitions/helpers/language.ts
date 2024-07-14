import { Language } from '@definitions/enums';

const LanguagesSet = new Set(Object.values(Language));

export function strToLanguage(lang: string) {
  if (LanguagesSet.has(lang as Language)) return lang as Language;
  throw new Error(`Invalid language: ${lang}`);
}
