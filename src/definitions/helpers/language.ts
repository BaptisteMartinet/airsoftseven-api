import { objectEntries } from '@/utils/record';
import { Language } from '@definitions/enums';
import { DefaultLanguage } from '@/constants/language';

const LanguageEnumToStrsObjMap: Record<Language, Array<string>> = {
  French: ['fr'],
  English: ['en'],
};
const StrToLanguageMap = new Map(
  objectEntries(LanguageEnumToStrsObjMap).flatMap(([language, strs]) => strs.map((str) => [str, language] as const)),
);

export function ensureStrLanguage(lang: string) {
  const language = StrToLanguageMap.get(lang);
  if (language) return language;
  return DefaultLanguage;
}
