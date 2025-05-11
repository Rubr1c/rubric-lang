import { Token } from '../lexer/tokens';
import { Expression, Statement } from './base';
import { Identifier } from './expressions';
import { TypeNode } from './types';

export class VarStatement implements Statement {
  public token: Token;
  public name: Identifier;
  public typeAnnotation: TypeNode | null;
  public value: Expression | null;

  constructor(
    token: Token,
    name: Identifier,
    typeAnnotation: TypeNode | null = null,
    value: Expression | null = null
  ) {
    this.token = token;
    this.name = name;
    this.typeAnnotation = typeAnnotation;
    this.value = value;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    let out = `${this.tokenLiteral()} ${this.name.toString()}`;
    if (this.typeAnnotation) {
      out += `: ${this.typeAnnotation.toString()}`;
    }
    if (this.value) {
      out += ` = ${this.value.toString()}`;
    }
    return out + ';';
  }
}

export class ConstStatement implements Statement {
  public token: Token;
  public name: Identifier;
  public typeAnnotation: TypeNode | null;
  public value: Expression | null;

  constructor(
    token: Token,
    name: Identifier,
    typeAnnotation: TypeNode | null = null,
    value: Expression | null = null
  ) {
    this.token = token;
    this.name = name;
    this.typeAnnotation = typeAnnotation;
    this.value = value;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    let out = `${this.tokenLiteral()} ${this.name.toString()}`;
    if (this.typeAnnotation) {
      out += `: ${this.typeAnnotation.toString()}`;
    }
    if (this.value) {
      out += ` = ${this.value.toString()}`;
    }
    return out + ';';
  }
}

export class ReturnStatement implements Statement {
  public token: Token;
  public returnValue: Expression | null;

  constructor(token: Token, returnValue: Expression | null = null) {
    this.token = token;
    this.returnValue = returnValue;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `${this.tokenLiteral()} ${this.returnValue?.toString() || ''};`;
  }
}

export class BlockStatement implements Statement {
  public token: Token;
  public statements: Statement[];

  constructor(token: Token, statements: Statement[] = []) {
    this.token = token;
    this.statements = statements;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    let out = '';
    for (const stmt of this.statements) {
      out += stmt.toString();
    }
    return `{ ${out} }`;
  }
}

export class IfStatement implements Statement {
  public token: Token;
  public condition: Expression;
  public consequence: BlockStatement;
  public alternative?: BlockStatement | IfStatement;

  constructor(
    token: Token,
    condition: Expression,
    consequence: BlockStatement,
    alternative?: BlockStatement | IfStatement
  ) {
    this.token = token;
    this.condition = condition;
    this.consequence = consequence;
    this.alternative = alternative;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    let out = `if (${this.condition.toString()}) ${this.consequence.toString()}`;
    if (this.alternative) {
      out +=
        this.alternative instanceof IfStatement
          ? ` else ${this.alternative.toString()}`
          : ` else ${this.alternative.toString()}`;
    }
    return out;
  }
}

export class ForStatement implements Statement {
  public token: Token;
  public init: Statement | null;
  public condition: Expression | null;
  public update: Expression | null;
  public body: BlockStatement;

  constructor(
    token: Token,
    body: BlockStatement,
    init: Statement | null = null,
    condition: Expression | null = null,
    update: Expression | null = null
  ) {
    this.token = token;
    this.init = init;
    this.condition = condition;
    this.update = update;
    this.body = body;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const parts: string[] = [];
    parts.push(this.init ? this.init.toString() : '');
    parts.push(this.condition ? this.condition.toString() : '');
    parts.push(this.update ? this.update.toString() : '');
    return `for (${parts.join(' ').trim()}) ${this.body.toString()}`;
  }
}

export class WhileStatement implements Statement {
  public token: Token;
  public condition: Expression;
  public body: BlockStatement;

  constructor(token: Token, condition: Expression, body: BlockStatement) {
    this.token = token;
    this.condition = condition;
    this.body = body;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `while (${this.condition.toString()}) ${this.body.toString()}`;
  }
}

export class DoWhileStatement implements Statement {
  public token: Token;
  public body: BlockStatement;
  public condition: Expression;

  constructor(token: Token, body: BlockStatement, condition: Expression) {
    this.token = token;
    this.body = body;
    this.condition = condition;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `do ${this.body.toString()} while (${this.condition.toString()});`;
  }
}

export class ExpressionStatement implements Statement {
  constructor(public token: Token, public expression: Expression) {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.expression.toString();
  }
}

// Represents a display statement (e.g., display("Hello", varName);)
export class DisplayStatement implements Statement {
  public token: Token;
  public args: Expression[];

  constructor(token: Token, args: Expression[]) {
    this.token = token;
    this.args = args;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    const argStrings = this.args.map((arg) => arg.toString()).join(', ');
    return `${this.tokenLiteral()}(${argStrings});`;
  }
}
