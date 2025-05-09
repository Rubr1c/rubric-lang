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
  ConstStatement,
  ExpressionStatement,
} from '../ast';

export enum Precedence {
  LOWEST = 1,
  EQUALS = 2,
  LESSGREATER = 3,
  SUM = 4,
  PRODUCT = 5,
  PREFIX = 6,
  CALL = 7,
  POSTFIX = 8,
  TERNARY = 9,
  LOGICAL = 10,
}

const precedences: Partial<Record<TokenType, Precedence>> = {
  [TokenType.EQUALS]: Precedence.EQUALS,
  [TokenType.NOT_EQUALS]: Precedence.EQUALS,
  [TokenType.LT]: Precedence.LESSGREATER,
  [TokenType.GT]: Precedence.LESSGREATER,

  [TokenType.PLUS]: Precedence.SUM,
  [TokenType.MINUS]: Precedence.SUM,

  [TokenType.SLASH]: Precedence.PRODUCT,
  [TokenType.ASTERISK]: Precedence.PRODUCT,
  [TokenType.PERCENT]: Precedence.PRODUCT,

  [TokenType.LPAREN]: Precedence.CALL,
  [TokenType.QUESTION_MARK]: Precedence.TERNARY,

  [TokenType.AND]: Precedence.LOGICAL,
  [TokenType.OR]: Precedence.LOGICAL,

  [TokenType.INCREMENT]: Precedence.POSTFIX,
  [TokenType.DECREMENT]: Precedence.POSTFIX,
};

export class Parser {
  private lexer: Lexer;
  private curToken: Token;
  private peekToken: Token;
  public errors: string[] = [];
  private prefixParseFns: Partial<Record<TokenType, () => Expression | null>> =
    {};
  private infixParseFns: Partial<
    Record<TokenType, (left: Expression) => Expression | null>
  > = {};

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.curToken = this.lexer.nextToken();
    this.peekToken = this.lexer.nextToken();

    // Register prefix parse functions
    this.registerPrefix(TokenType.IDENTIFIER, this.parseIdentifier.bind(this));
    this.registerPrefix(TokenType.INT, this.parseIntegerLiteral.bind(this));
    this.registerPrefix(TokenType.FLOAT, this.parseFloatLiteral.bind(this));
    this.registerPrefix(TokenType.STRING, this.parseStringLiteral.bind(this));
    this.registerPrefix(TokenType.BOOLEAN, this.parseBooleanLiteral.bind(this));
    this.registerPrefix(TokenType.BANG, this.parsePrefixExpression.bind(this));
    this.registerPrefix(TokenType.MINUS, this.parsePrefixExpression.bind(this));
    this.registerPrefix(
      TokenType.INCREMENT,
      this.parsePrefixExpression.bind(this)
    );
    this.registerPrefix(
      TokenType.DECREMENT,
      this.parsePrefixExpression.bind(this)
    );
    this.registerPrefix(
      TokenType.LPAREN,
      this.parseGroupedExpression.bind(this)
    );
    // Register infix parse functions
    this.registerInfix(TokenType.PLUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.MINUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.SLASH, this.parseInfixExpression.bind(this));
    this.registerInfix(
      TokenType.ASTERISK,
      this.parseInfixExpression.bind(this)
    );
    this.registerInfix(TokenType.PERCENT, this.parseInfixExpression.bind(this));
    this.registerInfix(
      TokenType.EQUALS_EQUALS,
      this.parseInfixExpression.bind(this)
    );
    this.registerInfix(
      TokenType.NOT_EQUALS,
      this.parseInfixExpression.bind(this)
    );
    this.registerInfix(TokenType.LT, this.parseInfixExpression.bind(this));
    this.registerInfix(TokenType.GT, this.parseInfixExpression.bind(this));
    this.registerInfix(
      TokenType.LT_EQUALS,
      this.parseInfixExpression.bind(this)
    );
    this.registerInfix(
      TokenType.GT_EQUALS,
      this.parseInfixExpression.bind(this)
    );
    this.registerInfix(TokenType.LPAREN, this.parseCallExpression.bind(this));
    this.registerInfix(
      TokenType.QUESTION_MARK,
      this.parseTernaryExpression.bind(this)
    );
    this.registerInfix(
      TokenType.INCREMENT,
      this.parsePostfixExpression.bind(this)
    );
    this.registerInfix(
      TokenType.DECREMENT,
      this.parsePostfixExpression.bind(this)
    );
  }

  private registerPrefix(
    tokenType: TokenType,
    fn: () => Expression | null
  ): void {
    this.prefixParseFns[tokenType] = fn;
  }

  private registerInfix(
    tokenType: TokenType,
    fn: (left: Expression) => Expression | null
  ): void {
    this.infixParseFns[tokenType] = fn;
  }

  private parseIdentifier(): Expression {
    return new Identifier(this.curToken, this.curToken.literal);
  }

  private parseIntegerLiteral(): Expression {
    return new IntegerLiteral(
      this.curToken,
      parseInt(this.curToken.literal, 10)
    );
  }

  private parseFloatLiteral(): Expression {
    return new FloatLiteral(this.curToken, parseFloat(this.curToken.literal));
  }

  private parseStringLiteral(): Expression {
    return new StringLiteral(this.curToken, this.curToken.literal);
  }

  private parseBooleanLiteral(): Expression {
    return new BooleanLiteral(this.curToken, this.curToken.literal === 'true');
  }

  private parsePrefixExpression(): Expression | null {
    // TODO: implement prefix parsing
    return null;
  }

  private parseInfixExpression(left: Expression): Expression | null {
    // TODO: implement infix parsing
    return null;
  }

  private parsePostfixExpression(left: Expression): Expression | null {
    // TODO: implement postfix parsing
    return null;
  }

  private parseCallExpression(fn: Expression): Expression | null {
    // TODO: implement call expression parsing
    return null;
  }

  private parseTernaryExpression(left: Expression): Expression | null {
    // TODO: implement ternary parsing
    return null;
  }

  private parseGroupedExpression(): Expression | null {
    // TODO: implement grouped ( ) parsing
    return null;
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

  private peekPrecedence(): Precedence {
    const p = precedences[this.peekToken.type];
    return p !== undefined ? p : Precedence.LOWEST;
  }

  private currentPrecedence(): Precedence {
    const p = precedences[this.curToken.type];
    return p !== undefined ? p : Precedence.LOWEST;
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
      case TokenType.CONST:
        return this.parseConstStatement();
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

  private parseConstStatement(): Statement | null {
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
    return new ConstStatement(token, name, typeAnnotation, expression);
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
