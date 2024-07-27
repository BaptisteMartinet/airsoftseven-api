import type { InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, STRING, DATE } from '@sequelize-graphql/core';
import sequelize from '@db/index';

export interface EmailVerificationCodeModel extends InferModelAttributesWithDefaults<EmailVerificationCodeModel> {
  email: string;
  code: string;
  expireAt: Date;
}

const EmailVerificationCode: Model<EmailVerificationCodeModel> = new Model({
  name: 'EmailVerificationCode',
  columns: {
    email: { type: STRING, allowNull: false, exposed: false },
    code: { type: STRING, allowNull: false, exposed: false },
    expireAt: { type: DATE, allowNull: false, exposed: false },
  },
  sequelize,
});

export default EmailVerificationCode;
