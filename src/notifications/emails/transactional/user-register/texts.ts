import { Language } from '@definitions/enums';
import { genTextsGetter } from '@notifications/emails/utils';

interface Definition {
  subject: string;
  welcomeMessage: string;
  linkMessage: string;
}

const FR: Definition = {
  subject: 'Validez votre inscription',
  welcomeMessage: 'Bienvenu',
  linkMessage: 'Veuillez valider votre email en cliquant sur le lien suivant.',
};

export default genTextsGetter<Definition>(
  new Map([
    [Language.French, FR], // TODO EN
  ]),
);
