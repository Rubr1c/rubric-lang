import { Token, TokenType } from './tokens';

export class Lexer {
  private input: string;
  private position: number = 0;
  private readPosition: number = 0;
  private char: string | null = null;
  private line: number = 1;
  private column: number = 0;
  private readingFuncArgs: boolean = false;

  constructor(input: string) {
    this.input = input;
    this.readChar();
  }

  public nextToken(): Token {
    let token: Token;

    this.skipWhitespaceAndComments();

    switch (this.char) {
      case '=':
        token = this.createToken(TokenType.EQUALS);
        break;
      case ':':
        token = this.createToken(TokenType.COLON);
        break;
      case ';':
        token = this.createToken(TokenType.SEMICOLON);
        break;
      case '+':
        token = this.createToken(TokenType.PLUS);
        break;
      case '-':
        token = this.createToken(TokenType.MINUS);
        break;
      case '*':
        token = this.createToken(TokenType.ASTERISK);
        break;
      case '/':
        token = this.createToken(TokenType.SLASH);
        break;
      case '%':
        token = this.createToken(TokenType.PERCENT);
        break;
      case '<':
        token = this.createToken(TokenType.LT);
        break;
      case '>':
        token = this.createToken(TokenType.GT);
        break;
      case '!':
        token = this.createToken(TokenType.BANG);
        break;
      case '(':
        token = this.createToken(TokenType.LPAREN);
        break;
      case ')':
        token = this.createToken(TokenType.RPAREN);
        break;
      case ',':
        token = this.createToken(TokenType.COMMA);
        break;
      case null:
        token = this.createToken(TokenType.EOF);
        break;
      case '"':
      case "'":
        const strStartCol = this.column;
        const stringLiteral = this.readString(this.char);

        token = {
          type: TokenType.STRING,
          literal: stringLiteral,
          line: this.line,
          column: strStartCol,
        };
        return token;
      default:
        if (this.isLetter(this.char)) {
          const identStartCol = this.column;
          const literal = this.readIdentifier();
          const type = this.lookupIdentifier(literal);

          token = { type, literal, line: this.line, column: identStartCol };
          return token;
        } else if (this.isDigit(this.char)) {
          const numStartCol = this.column;
          const literal = this.readNumber();
          token = {
            type: TokenType.NUMBER,
            literal,
            line: this.line,
            column: numStartCol,
          };
          return token;
        } else {
          token = this.createToken(TokenType.ILLEGAL);
        }
        break;
    }

    this.readChar();

    return token;
  }

  private createToken(tokenType: TokenType): Token {
    return {
      type: tokenType,
      literal: this.char ?? '',
      line: this.line,
      column: this.column,
    };
  }

  private readChar(): void {
    if (this.readPosition >= this.input.length) {
      this.char = null;
    } else {
      this.char = this.input[this.readPosition];
    }

    this.position = this.readPosition;

    if (this.char !== null) {
      if (this.char === '\n') {
        this.line++;
        this.column = 0;
      } else if (this.char !== '\r') {
        this.column++;
      }
    }

    this.readPosition++;
  }

  private peekChar(): string | null {
    if (this.readPosition > this.input.length) {
      return null;
    }

    return this.input[this.readPosition];
  }

  private skipWhitespaceAndComments(): void {
    while (true) {
      if (this.char === null) return;

      if (/\s/.test(this.char)) {
        this.readChar();
        continue;
      }

      if (this.char === '/' && this.peekChar() === '/') {
        this.skipSingleLineComment();
        continue;
      }

      if (this.char === '/' && this.peekChar() === '*') {
        this.skipBlockComment();
        continue;
      }

      break;
    }
  }

  private isLetter(char: string | null): boolean {
    if (char == null) return false;

    if (/^[A-Za-z_]+$/.test(char)) return true;

    return false;
  }

  private readIdentifier(): string {
    const startPosition = this.position;

    while (this.isLetter(this.char)) this.readChar();

    return this.input.substring(startPosition, this.position);
  }

  private lookupIdentifier(identifier: string): TokenType {
    switch (identifier) {
      case 'var':
        return TokenType.VAR;
      case 'string':
        return TokenType.TYPE_STRING;
      case 'bool':
        return TokenType.TYPE_BOOLEAN;
      case 'int':
        return TokenType.TYPE_INT;
      case 'true':
      case 'false':
        return TokenType.BOOLEAN;
      default:
        return TokenType.IDENTIFIER;
    }
  }

  private isDigit(char: string | null): boolean {
    if (char === null) return false;

    return /\d/.test(char);
  }

  private readNumber(): string {
    const startPosition = this.position;

    while (this.isDigit(this.char)) this.readChar();

    return this.input.substring(startPosition, this.position);
  }

  private readString(quoteType: '"' | "'"): string {
    const startPosition = this.position + 1;
    this.readChar();

    while (this.char !== null && this.char !== quoteType) this.readChar();

    if (this.char === null) throw new Error('unterminated string');

    const strContent = this.input.substring(startPosition, this.position);
    this.readChar();
    return strContent;
  }

  private skipSingleLineComment(): void {
    this.readChar();
    this.readChar();
    while (this.char !== '\n' && this.char !== null) {
      this.readChar();
    }
  }

  private skipBlockComment(): void {
    this.readChar();
    this.readChar();
    while (this.char !== null) {
      if (this.char === '*' && this.peekChar() === '/') {
        this.readChar();
        this.readChar();
        break;
      }
      this.readChar();
    }
  }
}
