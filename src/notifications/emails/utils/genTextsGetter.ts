import { Language } from '@definitions/enums';

export default function genTextsGetter<DefinitionT>(definitions: Map<Language, DefinitionT>) {
  return (language: Language) => {
    const text = definitions.get(language);
    if (!text) throw new Error(`Unsupported Language: ${language}`);
    return text;
  };
}
