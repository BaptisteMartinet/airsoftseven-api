import React from 'react';
import { ensureStylesType } from '@notifications/emails/utils';

export default function Footer() {
  return (
    <React.Fragment>
      <tr>
        <td height={64} />
      </tr>
      <tr>
        <td style={styles.copyrights} align="center">
          Copyright &copy; 2023 Taale, All rights reserved
        </td>
      </tr>
    </React.Fragment>
  );
}

const styles = ensureStylesType({
  copyrights: {
    height: '32px',
    backgroundColor: '#50abf1',
    fontSize: '16px',
  },
});
