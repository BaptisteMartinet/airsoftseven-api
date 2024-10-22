import type { InferModelAttributesWithDefaults } from '@sequelize-graphql/core';

import { Model, STRING, DATE } from '@sequelize-graphql/core';
import sequelize from '@db/index';
import { EmailVerificationCodeTypeEnum, type EmailVerificationCodeType } from '@definitions/enums';

export interface EmailVerificationCodeModel extends InferModelAttributesWithDefaults<EmailVerificationCodeModel> {
  email: string;
  code: string;
  type: EmailVerificationCodeType;
  expiredAt: Date;
}

const EmailVerificationCode: Model<EmailVerificationCodeModel> = new Model({
  name: 'EmailVerificationCode',
  columns: {
    email: { type: STRING, allowNull: false, exposed: false },
    code: { type: STRING, allowNull: false, exposed: false },
    type: { type: EmailVerificationCodeTypeEnum, allowNull: false, exposed: false },
    expiredAt: { type: DATE, allowNull: false, exposed: false },
  },
  indexes: [{ fields: ['email', 'code', 'type'], unique: true }],
  sequelize,
});

export default EmailVerificationCode;
