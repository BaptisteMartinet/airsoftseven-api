import type { ColumnDefinition } from '@sequelize-graphql/core';

import { STRING } from '@sequelize-graphql/core';

export interface SlugColumnsT {
  slugBase: string;
  slug: string;
}

export const SlugColumns = {
  slugBase: { type: STRING, allowNull: false, exposed: true },
  slug: { type: STRING, allowNull: false, exposed: true },
} as const satisfies Record<string, ColumnDefinition>;
