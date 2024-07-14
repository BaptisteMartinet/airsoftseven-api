import type { CSSProperties, ReactElement } from 'react';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ensureStylesType } from './index';

export interface RenderEmailArgs {
  title?: string;
  element: ReactElement;
}

export default function renderEmailHTMLPage(args: RenderEmailArgs) {
  const { title, element } = args;
  const doctype =
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
  const html = renderToStaticMarkup(
    <html>
      <head>
        <meta httpEquiv="Content-Type" content="text/html, charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,900;1,400;1,900&display=swap"
          rel="stylesheet"
        />
        {title && <title>{title}</title>}
      </head>
      <body style={styles.body}>
        <table style={styles.outerTable} border={0} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td align="center">
                <table style={styles.innerTable} border={0} cellPadding={0} cellSpacing={0}>
                  {element}
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>,
  );
  return [doctype, html].join('\n');
}

const styles = ensureStylesType({
  body: {
    margin: 0,
    padding: 0,
    fontFamily: 'Roboto, Arial, sans-serif',
    fontWeight: 400,
  },
  outerTable: {
    width: '100%',
  },
  innerTable: {
    width: '100%',
    maxWidth: '600px',
  },
});
