import { GraphQLError } from 'graphql';

export class ClientError extends GraphQLError {
  constructor(code: string, message: string) {
    super(message, { extensions: { code } });
    this.name = 'ClientError';
  }
}

export class AuthRequired extends ClientError {
  constructor(message: string) {
    super('AuthRequired', message);
  }
}

export class ResourceDoesNotExist extends ClientError {
  constructor(modelName: string, identifier: string) {
    super('ResourceDoesNotExist', `${modelName}#${identifier} does not exist.`);
  }
}

export class InvalidPermissions extends ClientError {
  constructor(message: string) {
    super('InvalidPermissions', message);
  }
}
