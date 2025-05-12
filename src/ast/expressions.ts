import { Token } from '../lexer/tokens';
import { Expression } from './base';
import { TypeNode } from './types';

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

export class ArrayLiteral implements Expression {
  public token: Token;
  public type: TypeNode;
  public elements: Expression[];

  constructor(token: Token, type: TypeNode, elements: Expression[]) {
    this.token = token;
    this.type = type;
    this.elements = elements;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const elementStrings = this.elements.map((el) => el.toString());
    return `[${elementStrings.join(', ')}]`;
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

  constructor(token: Token, left: Expression, operator: string) {
    this.token = token;
    this.operator = operator;
    this.left = left;
  }

  expressionNode(): void {}

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

export class AssignmentExpression implements Expression {
  constructor(
    public token: Token,
    public name: Identifier,
    public operator: string,
    public value: Expression
  ) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `(${this.name.toString()} ${
      this.operator
    } ${this.value.toString()})`;
  }
}

export class CallExpression implements Expression {
  constructor(
    public token: Token,
    public func: Expression,
    public args: Expression[]
  ) {}

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const argStrings = this.args.map((arg) => arg.toString());
    return `${this.func.toString()}(${argStrings.join(', ')})`;
  }
}

export class IndexExpression implements Expression {
  public token: Token;
  public left: Expression;
  public index: Expression;

  constructor(token: Token, left: Expression, index: Expression) {
    this.token = token;
    this.left = left;
    this.index = index;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `(${this.left.toString()}[${this.index.toString()}])`;
  }
}
