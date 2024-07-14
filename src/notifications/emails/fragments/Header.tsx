import React from 'react';
import { ensureStylesType } from '@notifications/emails/utils';

export default function Header() {
  return (
    <React.Fragment>
      <tr>
        <td style={styles.container} align="center">
          <img src="https://i.imgur.com/v6KEBef.png" width={48} height={48} alt="Taale logo" />
        </td>
      </tr>
      <tr>
        <td height={64} />
      </tr>
    </React.Fragment>
  );
}

const styles = ensureStylesType({
  container: {
    height: '64px',
    backgroundColor: '#50abf1',
  },
});
