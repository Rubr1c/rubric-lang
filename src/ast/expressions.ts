import { Token } from '../lexer/tokens';
import { Expression } from './base';

export class Identifier implements Expression {
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

export class IntegerLiteral implements Expression {
  public token: Token;
  public value: number;

  constructor(token: Token, value: number) {
    this.token = token;
    this.value = value;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.value.toString();
  }
}

export class FloatLiteral implements Expression {
  public token: Token;
  public value: number;

  constructor(token: Token, value: number) {
    this.token = token;
    this.value = value;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.value.toString();
  }
}

export class StringLiteral implements Expression {
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

export class BooleanLiteral implements Expression {
  public token: Token;
  public value: boolean;

  constructor(token: Token, value: boolean) {
    this.token = token;
    this.value = value;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.value.toString();
  }
}

export class PrefixExpression implements Expression {
  public token: Token;
  public operator: string;
  public right: Expression;

  constructor(token: Token, operator: string, right: Expression) {
    this.token = token;
    this.operator = operator;
    this.right = right;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `(${this.operator}${this.right.toString()})`;
  }
}

export class PostfixExpression implements Expression {
  public token: Token;
  public operator: string;
  public left: Expression;

  constructor(token: Token, operator: string, left: Expression) {
    this.token = token;
    this.operator = operator;
    this.left = left;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `(${this.left.toString()}${this.operator})`;
  }
}

export class InfixExpression implements Expression {
  public token: Token;
  public left: Expression;
  public operator: string;
  public right: Expression;

  constructor(
    token: Token,
    left: Expression,
    operator: string,
    right: Expression
  ) {
    this.token = token;
    this.left = left;
    this.right = right;
    this.operator = operator;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `(${this.left.toString()} ${
      this.operator
    } ${this.right.toString()})`;
  }
}

export class TernaryExpression implements Expression {
  public token: Token;
  public condition: Expression;
  public consequent: Expression;
  public alternate: Expression;

  constructor(
    token: Token,
    condition: Expression,
    consequent: Expression,
    alternate: Expression
  ) {
    this.token = token;
    this.condition = condition;
    this.consequent = consequent;
    this.alternate = alternate;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `(${this.condition.toString()} ? ${this.consequent.toString()} : ${this.alternate.toString()})`;
  }
}
