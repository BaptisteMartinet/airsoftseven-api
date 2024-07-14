import type { CSSProperties } from 'react';

export default function ensureStylesType<T extends Record<string, CSSProperties>>(styles: T) {
  return styles;
}
