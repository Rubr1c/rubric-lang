import { Token } from '../lexer/tokens';
import { Expression, Statement } from './base';
import { BlockStatement } from './statements';
import { Identifier } from './expressions';
import { TypeNode } from './types';

export class FunctionLiteral implements Expression {
  public token: Token;
  public params: Param[];
  public returnType: TypeNode;
  public body: BlockStatement;

  constructor(
    token: Token,
    params: Param[] = [],
    body: BlockStatement,
    returnType: TypeNode
  ) {
    this.token = token;
    this.params = params;
    this.returnType = returnType;
    this.body = body;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const paramsStr = this.params
      .map((p) => `${p.value}: ${p.type.toString()}`)
      .join(', ');
    const returnStr = `: ${this.returnType.toString()}`;
    return `${this.tokenLiteral()}(${paramsStr})${returnStr} ${this.body.toString()}`;
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
