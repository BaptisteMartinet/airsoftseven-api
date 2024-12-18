import { Language } from '@definitions/enums';
import { genTextsGetter } from '@notifications/emails/utils';

interface Definition {
  subject: string;
  formatText: (code: string) => string;
}

const FR: Definition = {
  subject: 'Validez votre email',
  formatText(code: string) {
    return [
      `Veuillez valider votre adresse email en indiquant le code suivant: ${code}`,
      'Nous sommes ravis de vous compter parmi nos premiers utilisateurs !',
      "- L'équipe AirsoftSeven",
    ].join('\n\n');
  },
};

const EN: Definition = {
  subject: 'Validate your email',
  formatText(code: string) {
    return [
      `Please validate your email address by entering the following code: ${code}`,
      'We are thrilled to count you among our first users!',
      "- The AirsoftSeven team",
    ].join('\n\n');
  },
};

export default genTextsGetter<Definition>(
  new Map([
    [Language.French, FR],
    [Language.English, EN],
  ]),
);
