import type { Context } from '@/context';

import * as React from 'react';
import { renderEmailHTMLPage, ensureStylesType } from '@notifications/emails/utils';
import { Header, Footer } from '@notifications/emails/fragments';
import texts from './texts';

interface UserRegisterProps {
  username: string;
  verifyUrl: string;
  ctx: Context;
}

function UserRegister(props: UserRegisterProps) {
  const { username, verifyUrl, ctx } = props;
  const T = texts(ctx.language);
  return (
    <tbody>
      <Header />
      <tr>
        <td align="center" style={styles.codeInfo}>
          {T.welcomeMessage} {username}
        </td>
      </tr>
      <tr>
        <td align="center" style={styles.code}>
          {T.linkMessage}
        </td>
      </tr>
      <tr>
        <td align="center">
          <a href={verifyUrl}>{verifyUrl}</a>
        </td>
      </tr>
      <Footer />
    </tbody>
  );
}

export default function render(args: UserRegisterProps) {
  return renderEmailHTMLPage({
    element: <UserRegister {...args} />,
  });
}

const styles = ensureStylesType({
  codeInfo: {
    fontSize: '24px',
  },
  code: {
    fontSize: '48px',
    fontWeight: 'bold',
  },
});
