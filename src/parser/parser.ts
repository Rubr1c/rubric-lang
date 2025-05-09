import { Lexer } from '../lexer/lexer';
import { Token, TokenType } from '../lexer/tokens';
import {
  Program,
  Statement,
  VarStatement,
  Identifier,
  TypeNode,
  Expression,
  IntegerLiteral,
  FloatLiteral,
  StringLiteral,
  BooleanLiteral,
} from '../ast';

export class Parser {
  private lexer: Lexer;
  private curToken: Token;
  private peekToken: Token;
  public errors: string[] = [];

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.curToken = this.lexer.nextToken();
    this.peekToken = this.lexer.nextToken();
  }

  private nextToken(): void {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  private peekTokenIs(type: TokenType): boolean {
    return this.peekToken.type === type;
  }

  private expectPeek(type: TokenType): boolean {
    if (this.peekTokenIs(type)) {
      this.nextToken();
      return true;
    } else {
      this.errors.push(
        `Expected next token to be ${type}, got ${this.peekToken.type}`
      );
      return false;
    }
  }

  public parseProgram(): Program {
    const program = new Program();
    while (this.curToken.type !== TokenType.EOF) {
      const stmt = this.parseStatement();
      if (stmt) {
        program.statements.push(stmt);
      }
      this.nextToken();
    }
    return program;
  }

  private parseStatement(): Statement | null {
    switch (this.curToken.type) {
      case TokenType.VAR:
        return this.parseVarStatement();
      default:
        return null;
    }
  }

  private parseVarStatement(): Statement | null {
    const token = this.curToken;
    if (!this.expectPeek(TokenType.IDENTIFIER)) {
      return null;
    }
    const name = new Identifier(this.curToken, this.curToken.literal);
    let typeAnnotation: TypeNode | null = null;
    if (this.peekToken.type === TokenType.COLON) {
      this.nextToken();
      this.nextToken();
      typeAnnotation = new TypeNode(this.curToken, this.curToken.literal);
    }

    let expression: Expression | null = null;
    if (this.peekToken.type === TokenType.EQUALS) {
      this.nextToken();
      this.nextToken();
      expression = this.parseExpression();
    }

    if (this.peekToken.type === TokenType.SEMICOLON) {
      this.nextToken();
    } else {
      return null;
    }
    return new VarStatement(token, name, typeAnnotation, expression);
  }

  private parseExpression(): Expression | null {
    switch (this.curToken.type) {
      case TokenType.IDENTIFIER:
        return new Identifier(this.curToken, this.curToken.literal);
      case TokenType.INT:
        return new IntegerLiteral(
          this.curToken,
          parseInt(this.curToken.literal, 10)
        );
      case TokenType.FLOAT:
        return new FloatLiteral(
          this.curToken,
          parseFloat(this.curToken.literal)
        );
      case TokenType.STRING:
        return new StringLiteral(this.curToken, this.curToken.literal);
      case TokenType.BOOLEAN:
        return new BooleanLiteral(
          this.curToken,
          this.curToken.literal === 'true'
        );
      default:
        return null;
    }
  }
}
