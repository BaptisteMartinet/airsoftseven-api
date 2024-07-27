import { Language } from '@definitions/enums';
import { genTextsGetter } from '@notifications/emails/utils';

interface Definition {
  subject: string;
  formatText: (args: { username: string; link: string }) => string;
}

const FR: Definition = {
  subject: 'Validez votre inscription',
  formatText({ username, link }) {
    return [
      `Bienvenu ${username},`,
      `Veuillez valider votre email en cliquant sur le lien suivant : ${link}`,
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
