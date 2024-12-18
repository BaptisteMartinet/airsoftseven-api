import { Language } from '@definitions/enums';
import { genTextsGetter } from '@notifications/emails/utils';

interface Definition {
  subject: string;
  formatText: (code: string) => string;
}

const FR: Definition = {
  subject: 'Réinitialisation de mot de passe',
  formatText(code: string) {
    return [
      `Veuillez réinitialiser votre mot de passe en indiquant le code suivant: ${code}`,
      "Si vous n'êtes pas à l'origine de cette demande veuillez contacter le support au plus vite.",
      "- L'équipe AirsoftSeven",
    ].join('\n\n');
  },
};

const EN: Definition = {
  subject: 'Password reset',
  formatText(code: string) {
    return [
      `Please reset your password by entering the following code: ${code}`,
      "If you did not make this request, please contact the support as soon as possible.",
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
