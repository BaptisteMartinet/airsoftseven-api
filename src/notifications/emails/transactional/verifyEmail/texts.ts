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

export default genTextsGetter<Definition>(
  new Map([
    [Language.French, FR], // TODO EN
  ]),
);
