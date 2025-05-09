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
  PrefixExpression,
  InfixExpression,
  PostfixExpression,
  CallExpression,
  TernaryExpression,
  ReturnStatement,
  FunctionDeclaration,
  Param,
  BlockStatement,
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
  private inFunction: boolean = false;
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
    const token = this.curToken;
    const operator = token.literal;
    this.nextToken();
    const right = this.parseExpression(Precedence.PREFIX)!;
    return new PrefixExpression(token, operator, right);
  }

  private parseInfixExpression(left: Expression): Expression | null {
    const token = this.curToken;
    const operator = token.literal;
    const prec = this.currentPrecedence();
    this.nextToken();
    const right = this.parseExpression(prec)!;
    return new InfixExpression(token, left, operator, right);
  }

  private parsePostfixExpression(left: Expression): Expression | null {
    const token = this.curToken;
    const operator = token.literal;
    return new PostfixExpression(token, left, operator);
  }

  private parseCallExpression(fn: Expression): Expression | null {
    const token = this.curToken;
    const args: Expression[] = [];
    if (this.peekToken.type !== TokenType.RPAREN) {
      this.nextToken();
      args.push(this.parseExpression(Precedence.LOWEST)!);
      while (this.peekTokenIs(TokenType.COMMA)) {
        this.nextToken();
        this.nextToken();
        args.push(this.parseExpression(Precedence.LOWEST)!);
      }
    }
    this.expectPeek(TokenType.RPAREN);
    return new CallExpression(token, fn, args);
  }

  private parseTernaryExpression(condition: Expression): Expression {
    const token = this.curToken;
    this.nextToken();
    const consequent = this.parseExpression(Precedence.TERNARY)!;
    this.expectPeek(TokenType.COLON);
    this.nextToken();
    const alternate = this.parseExpression(Precedence.TERNARY)!;
    return new TernaryExpression(token, condition, consequent, alternate);
  }

  private parseGroupedExpression(): Expression | null {
    this.nextToken();
    const exp = this.parseExpression(Precedence.LOWEST)!;
    this.expectPeek(TokenType.RPAREN);
    return exp;
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

  private parseTypeAnnotation(): TypeNode | null {
    if (!this.expectPeek(TokenType.COLON)) {
      return null;
    }
    const nextType = this.peekToken.type;
    const validTypes = [
      TokenType.TYPE_STRING,
      TokenType.TYPE_BOOLEAN,
      TokenType.TYPE_INT,
      TokenType.TYPE_FLOAT,
    ];
    if (!validTypes.includes(nextType)) {
      this.errors.push(`Invalid type annotation: ${this.peekToken.literal}`);
      return null;
    }
    this.nextToken();
    return new TypeNode(this.curToken, this.curToken.literal);
  }

  private curTokenIs(type: TokenType): boolean {
    return this.curToken.type === type;
  }

  private parseBlockStatement(): BlockStatement {
    const block = new BlockStatement(this.curToken, []);
    this.nextToken();
    while (
      !this.curTokenIs(TokenType.RCURLY) &&
      this.curToken.type !== TokenType.EOF
    ) {
      const stmt = this.parseStatement();
      if (stmt) {
        block.statements.push(stmt);
      }
      this.nextToken();
    }
    return block;
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
      case TokenType.FUNCTION:
        return this.parseFunctionDecleration();
      case TokenType.RETURN_STATEMENT:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseFunctionDecleration(): Statement | null {
    const token = this.curToken;
    if (!this.expectPeek(TokenType.IDENTIFIER)) {
      return null;
    }
    const name = new Identifier(this.curToken, this.curToken.literal);
    if (!this.expectPeek(TokenType.LPAREN)) {
      return null;
    }
    const params: Param[] = [];
    if (this.peekToken.type !== TokenType.RPAREN) {
      this.nextToken();
      do {
        if (this.curToken.type !== TokenType.IDENTIFIER) {
          return null;
        }
        const paramNameToken = this.curToken;
        const paramNameValue = this.curToken.literal;
        const paramTypeNode = this.parseTypeAnnotation();
        if (!paramTypeNode) {
          return null;
        }
        const param = new Param(paramNameToken, paramNameValue, paramTypeNode);
        params.push(param);
        if (this.peekToken.type === TokenType.COMMA) {
          this.nextToken();
          this.nextToken();
        } else {
          break;
        }
      } while (true);
    }
    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }

    const returnType = this.parseTypeAnnotation();
    if (!returnType) {
      return null;
    }

    if (!this.expectPeek(TokenType.LCURLY)) {
      return null;
    }
    const wasInFunction = this.inFunction;
    this.inFunction = true;
    const body = this.parseBlockStatement();
    this.inFunction = wasInFunction;
    return new FunctionDeclaration(token, name, params, body, returnType);
  }

  private parseVarStatement(): Statement | null {
    const token = this.curToken;
    if (!this.expectPeek(TokenType.IDENTIFIER)) {
      return null;
    }

    const name = new Identifier(this.curToken, this.curToken.literal);

    // Optional type annotation
    let typeAnnotation: TypeNode | null = null;
    if (this.peekToken.type === TokenType.COLON) {
      typeAnnotation = this.parseTypeAnnotation();
      if (!typeAnnotation) {
        return null;
      }
    }

    let expression: Expression | null = null;
    if (this.peekToken.type === TokenType.EQUALS) {
      this.nextToken();
      this.nextToken();
      expression = this.parseExpression(Precedence.LOWEST);
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
      typeAnnotation = this.parseTypeAnnotation();
      if (!typeAnnotation) {
        return null;
      }
    }

    let expression: Expression | null = null;
    if (this.peekToken.type === TokenType.EQUALS) {
      this.nextToken();
      this.nextToken();
      expression = this.parseExpression(Precedence.LOWEST);
    }

    if (this.peekToken.type === TokenType.SEMICOLON) {
      this.nextToken();
    } else {
      return null;
    }
    return new ConstStatement(token, name, typeAnnotation, expression);
  }

  private parseExpression(precedence: Precedence): Expression | null {
    const prefix = this.prefixParseFns[this.curToken.type];
    if (!prefix) {
      return null;
    }
    let leftExp = prefix.call(this);

    while (
      !this.peekTokenIs(TokenType.SEMICOLON) &&
      precedence < this.peekPrecedence()
    ) {
      const infix = this.infixParseFns[this.peekToken.type];
      if (!infix) break;
      this.nextToken();
      leftExp = infix.call(this, leftExp!);
    }
    return leftExp;
  }

  private parseExpressionStatement(): Statement | null {
    const stmt = new ExpressionStatement(
      this.curToken,
      this.parseExpression(Precedence.LOWEST)!
    );

    if (!this.expectPeek(TokenType.SEMICOLON)) {
      return null;
    }
    return stmt;
  }

  private parseReturnStatement(): Statement | null {
    if (!this.inFunction) {
      this.errors.push(
        `Return statement not allowed outside of function at line ${this.curToken.line}`
      );
      return null;
    }
    const token = this.curToken;
    this.nextToken();
    let returnValue: Expression | null = null;
    if (!this.curTokenIs(TokenType.SEMICOLON)) {
      returnValue = this.parseExpression(Precedence.LOWEST);
    }
    if (!this.expectPeek(TokenType.SEMICOLON)) {
      return null;
    }
    return new ReturnStatement(token, returnValue);
  }
}
