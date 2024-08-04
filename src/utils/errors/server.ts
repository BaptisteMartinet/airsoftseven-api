import { GraphQLError } from 'graphql';

export class ServerError extends GraphQLError {
  constructor(message: string) {
    super(message);
    this.name = 'ServerError';
  }
}
