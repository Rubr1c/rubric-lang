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
  AssignmentExpression,
  CallExpression,
  TernaryExpression,
  ReturnStatement,
  FunctionDeclaration,
  Param,
  BlockStatement,
  IfStatement,
  ForStatement,
  WhileStatement,
  DoWhileStatement,
} from '../ast';

export enum Precedence {
  LOWEST = 1,
  ASSIGN = 2,
  TERNARY = 3,
  LOGICAL = 4,
  EQUALS = 5,
  LESSGREATER = 6,
  SUM = 7,
  PRODUCT = 8,
  PREFIX = 9,
  POSTFIX = 10,
  CALL = 11,
}

const precedences: Partial<Record<TokenType, Precedence>> = {
  [TokenType.EQUALS]: Precedence.ASSIGN,
  [TokenType.EQUALS_EQUALS]: Precedence.EQUALS,
  [TokenType.NOT_EQUALS]: Precedence.EQUALS,
  [TokenType.LT]: Precedence.LESSGREATER,
  [TokenType.GT]: Precedence.LESSGREATER,
  [TokenType.LT_EQUALS]: Precedence.LESSGREATER,
  [TokenType.GT_EQUALS]: Precedence.LESSGREATER,

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
    this.registerInfix(
      TokenType.EQUALS,
      this.parseAssignmentExpression.bind(this)
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

  private parseTernaryExpression(left: Expression): Expression | null {
    const operatorToken = this.curToken;

    this.nextToken();
    const consequence = this.parseExpression(Precedence.LOWEST);
    if (!consequence) {
      this.errors.push(
        `Expected consequence for ternary operator at line ${operatorToken.line}`
      );
      return null;
    }

    if (!this.expectPeek(TokenType.COLON)) {
      return null;
    }

    this.nextToken();
    const alternative = this.parseExpression(Precedence.LOWEST);
    if (!alternative) {
      this.errors.push(
        `Expected alternative for ternary operator at line ${this.curToken.line}`
      );
      return null;
    }

    return new TernaryExpression(operatorToken, left, consequence, alternative);
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
    const nextTypeToken = this.peekToken;
    const specificValidTypes = [
      TokenType.TYPE_STRING,
      TokenType.TYPE_BOOLEAN,
      TokenType.TYPE_INT,
      TokenType.TYPE_FLOAT,
    ];

    if (
      !specificValidTypes.includes(nextTypeToken.type) &&
      nextTypeToken.type !== TokenType.IDENTIFIER
    ) {
      this.errors.push(
        `Invalid token for type annotation: '${nextTypeToken.literal}' (${nextTypeToken.type}) at line ${nextTypeToken.line}. Expected a built-in type (string, boolean, int, float) or an identifier for the type name.`
      );
      this.nextToken();
      this.nextToken();
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
      case TokenType.IF_STATEMENT:
        return this.parseIfStatement();
      case TokenType.FUNCTION:
        return this.parseFunctionDecleration();
      case TokenType.RETURN_STATEMENT:
        return this.parseReturnStatement();
      case TokenType.FOR_STATEMENT:
        return this.parseForStatement();
      case TokenType.WHILE_STATEMENT:
        return this.parseWhileStatement();
      case TokenType.DO_STATEMENT:
        return this.parseDoWhileStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseDoWhileStatement(): Statement | null {
    const token = this.curToken;

    if (!this.expectPeek(TokenType.LCURLY)) {
      return null;
    }

    const body = this.parseBlockStatement();

    if (!this.expectPeek(TokenType.WHILE_STATEMENT)) {
      return null;
    }

    if (!this.expectPeek(TokenType.LPAREN)) {
      return null;
    }

    const condition = this.parseExpression(Precedence.LOWEST);
    if (!condition) {
      this.errors.push(
        `Expected condition expression for do while statement at line ${this.curToken.line}`
      );
      return null;
    }


    if (!this.expectPeek(TokenType.SEMICOLON)) {
      return null;
    }

    return new DoWhileStatement(token, body, condition);
  }

  private parseWhileStatement(): Statement | null {
    const token = this.curToken;

    if (!this.expectPeek(TokenType.LPAREN)) {
      return null;
    }
    this.nextToken();

    const condition = this.parseExpression(Precedence.LOWEST);

    if (!condition) {
      this.errors.push(
        `Expected condition expression for while statement at line ${this.curToken.line}`
      );
      return null;
    }

    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }

    if (!this.expectPeek(TokenType.LCURLY)) {
      return null;
    }

    const body = this.parseBlockStatement();

    return new WhileStatement(token, condition, body);
  }

  private parseForStatement(): ForStatement | null {
    const token = this.curToken;

    if (!this.expectPeek(TokenType.LPAREN)) {
      return null;
    }
    this.nextToken();

    const init = this.parseStatement();

    if (!this.curTokenIs(TokenType.SEMICOLON)) {
      this.errors.push(
        `Expected ';' after for-loop initializer at line ${this.curToken.line}, got ${this.curToken.type}`
      );
      return null;
    }
    this.nextToken();

    const condition = this.parseExpression(Precedence.LOWEST);

    if (!this.expectPeek(TokenType.SEMICOLON)) {
      return null;
    }
    this.nextToken();

    const update = this.parseExpression(Precedence.LOWEST);

    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }

    if (!this.expectPeek(TokenType.LCURLY)) {
      return null;
    }

    const body = this.parseBlockStatement();

    return new ForStatement(token, body, init, condition, update);
  }

  private parseIfStatement(): IfStatement | null {
    const token = this.curToken;

    if (!this.expectPeek(TokenType.LPAREN)) {
      return null;
    }
    this.nextToken();

    const condition = this.parseExpression(Precedence.LOWEST);
    if (!condition) {
      this.errors.push(
        `Expected condition expression for if statement at line ${this.curToken.line}`
      );
      return null;
    }

    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }
    if (!this.expectPeek(TokenType.LCURLY)) {
      return null;
    }

    const consequence = this.parseBlockStatement();

    let alternative: BlockStatement | IfStatement | undefined;

    if (this.peekTokenIs(TokenType.ELSE_STATEMENT)) {
      this.nextToken();
      if (this.peekTokenIs(TokenType.IF_STATEMENT)) {
        this.nextToken();
        alternative = this.parseIfStatement()!;
      } else if (this.peekTokenIs(TokenType.LCURLY)) {
        this.nextToken();
        alternative = this.parseBlockStatement();
      } else {
        this.errors.push(
          `Expected 'if' or '{' after 'else', got ${this.peekToken.type} at line ${this.peekToken.line}`
        );
        return null;
      }
    }
    return new IfStatement(token, condition, consequence, alternative);
  }

  private parseFunctionDecleration(): Statement | null {
    const token = this.curToken;
    if (!this.expectPeek(TokenType.IDENTIFIER)) {
      this.errors.push(
        `Expected function name (identifier) after 'function' keyword at line ${this.curToken.line}`
      );
      return null;
    }
    const name = new Identifier(this.curToken, this.curToken.literal);
    if (!this.expectPeek(TokenType.LPAREN)) {
      this.errors.push(
        `Expected '(' after function name '${name.value}' at line ${this.curToken.line}`
      );
      return null;
    }
    const params: Param[] = [];
    if (this.peekToken.type !== TokenType.RPAREN) {
      this.nextToken();
      do {
        if (this.curToken.type !== TokenType.IDENTIFIER) {
          this.errors.push(
            `Expected parameter name (identifier) in function declaration at line ${this.curToken.line}`
          );
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
      this.errors.push(
        `Expected ')' or ',' after parameter in function '${name.value}' at line ${this.curToken.line}`
      );
      return null;
    }

    let fnReturnType: TypeNode | undefined = undefined;

    if (this.peekTokenIs(TokenType.COLON)) {
      const parsedReturnType = this.parseTypeAnnotation();
      if (!parsedReturnType) {
        return null;
      }
      fnReturnType = parsedReturnType;
    }

    if (!this.expectPeek(TokenType.LCURLY)) {
      this.errors.push(
        `Expected '{' before function body for function '${name.value}' at line ${this.curToken.line}`
      );
      return null;
    }
    const wasInFunction = this.inFunction;
    this.inFunction = true;
    const body = this.parseBlockStatement();
    this.inFunction = wasInFunction;
    return new FunctionDeclaration(token, name, params, body, fnReturnType);
  }

  private parseVarStatement(): Statement | null {
    const token = this.curToken;
    if (!this.expectPeek(TokenType.IDENTIFIER)) {
      this.errors.push(
        `Expected variable name (identifier) after 'var' keyword at line ${this.curToken.line}`
      );
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
      this.errors.push(
        `Expected ';' after var declaration for '${name.value}' at line ${this.peekToken.line}`
      );
      return null;
    }
    return new VarStatement(token, name, typeAnnotation, expression);
  }

  private parseConstStatement(): Statement | null {
    const token = this.curToken;
    if (!this.expectPeek(TokenType.IDENTIFIER)) {
      this.errors.push(
        `Expected constant name (identifier) after 'const' keyword at line ${this.curToken.line}`
      );
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

    if (!this.expectPeek(TokenType.EQUALS)) {
      this.errors.push(
        `Expected '=' after const identifier '${name.value}' at line ${this.curToken.line}`
      );
      return null;
    }

    this.nextToken();
    const expression = this.parseExpression(Precedence.LOWEST);
    if (!expression) {
      this.errors.push(
        `Expected expression after '=' in const declaration for '${name.value}' at line ${this.curToken.line}`
      );
      return null;
    }

    if (this.peekToken.type === TokenType.SEMICOLON) {
      this.nextToken();
    } else {
      this.errors.push(
        `Expected ';' after const declaration for '${name.value}' at line ${this.peekToken.line}`
      );
      return null;
    }
    return new ConstStatement(token, name, typeAnnotation, expression);
  }

  private parseExpression(precedence: Precedence): Expression | null {
    const prefix = this.prefixParseFns[this.curToken.type];
    if (!prefix) {
      this.errors.push(
        `No prefix parse function found for token ${this.curToken.type} ('${this.curToken.literal}') at line ${this.curToken.line}`
      );
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
    const statementToken = this.curToken;
    const expression = this.parseExpression(Precedence.LOWEST);
    if (!expression) {
      return null;
    }
    const stmt = new ExpressionStatement(statementToken, expression);

    if (!this.expectPeek(TokenType.SEMICOLON)) {
      return null;
    }
    return stmt;
  }

  private parseReturnStatement(): Statement | null {
    if (!this.inFunction) {
      this.errors.push(
        `Return statement is not allowed outside of a function body at line ${this.curToken.line}`
      );
      return null;
    }
    const returnToken = this.curToken;
    this.nextToken(); // Consume RETURN token

    let returnValue: Expression | null = null;

    if (!this.curTokenIs(TokenType.SEMICOLON)) {
      // If there's something after 'return' (not just 'return;')
      returnValue = this.parseExpression(Precedence.LOWEST);
      // If parsing an expression failed AND we are not already at a semicolon that might terminate a bad expression
      if (!returnValue && !this.curTokenIs(TokenType.SEMICOLON)) {
        this.errors.push(
          `Expected expression or ';' after 'return' keyword at line ${this.curToken.line}`
        );
        return null;
      }
    }

    if (this.curTokenIs(TokenType.SEMICOLON)) {
    } else {
      if (!this.expectPeek(TokenType.SEMICOLON)) {
        return null;
      }
    }
    return new ReturnStatement(returnToken, returnValue);
  }

  private parseAssignmentExpression(left: Expression): Expression | null {
    if (!(left instanceof Identifier)) {
      this.errors.push(
        `Invalid assignment target at line ${this.curToken.line}. Expected an identifier, got ${left.constructor.name}.`
      );
      return null;
    }
    const identifier = left as Identifier;
    const assignToken = this.curToken;

    const currentPrecedence = this.currentPrecedence();
    this.nextToken();
    const right = this.parseExpression(currentPrecedence - 1);

    if (!right) {
      this.errors.push(
        `Expected expression after '=' in assignment to '${identifier.value}' at line ${assignToken.line}`
      );
      return null;
    }

    return new AssignmentExpression(
      assignToken,
      identifier,
      assignToken.literal,
      right
    );
  }
}
