import { Token } from '../lexer/tokens';
import { Expression, Statement } from './base';
import { BlockStatement } from './statements';
import { Identifier } from './expressions';
import { TypeNode } from './types';

export class CallExpression implements Expression {
  public token: Token;
  public callee: Expression;
  public args: Expression[];

  constructor(token: Token, callee: Expression, args: Expression[] = []) {
    this.token = token;
    this.callee = callee;
    this.args = args;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const argStr = this.args.map((a) => a.toString()).join(', ');
    return `${this.callee.toString()}(${argStr})`;
  }
}

export class FunctionLiteral implements Expression {
  public token: Token;
  public name?: Identifier;
  public params: Identifier[];
  public returnType?: TypeNode;
  public body: BlockStatement;

  constructor(
    token: Token,
    params: Identifier[] = [],
    body: BlockStatement,
    name?: Identifier,
    returnType?: TypeNode
  ) {
    this.token = token;
    this.name = name;
    this.params = params;
    this.returnType = returnType;
    this.body = body;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const paramsStr = this.params.map((p) => p.toString()).join(', ');
    const nameStr = this.name ? this.name.toString() : '';
    const returnStr = this.returnType ? `: ${this.returnType}` : '';
    return `${nameStr}${this.tokenLiteral()}(${paramsStr})${returnStr} ${this.body.toString()}`;
  }
}

export class FunctionDeclaration implements Statement {
  public token: Token;
  public name: Identifier;
  public params: Identifier[];
  public returnType?: TypeNode;
  public body: BlockStatement;

  constructor(
    token: Token,
    name: Identifier,
    params: Param[] = [],
    body: BlockStatement,
    returnType?: TypeNode
  ) {
    this.token = token;
    this.name = name;
    this.params = params;
    this.returnType = returnType;
    this.body = body;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const paramsStr = this.params.map((p) => p.toString()).join(', ');
    const returnStr = this.returnType ? `: ${this.returnType}` : '';
    return `${this.tokenLiteral()} ${this.name.toString()}(${paramsStr})${returnStr} ${this.body.toString()}`;
  }
}

export class Param extends Identifier {
  public type: TypeNode;

  constructor(token: Token, value: string, type: TypeNode) {
    super(token, value);
    this.type = type;
  }
}
