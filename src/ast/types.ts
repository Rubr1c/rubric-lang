import { Token } from '../lexer/tokens';
import { Node } from './base';

export class TypeNode implements Node {
  public token: Token;
  public value: string;

  constructor(token: Token, value: string) {
    this.token = token;
    this.value = value;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.value;
  }
}
