import { Token, TokenType } from './tokens';

export class Lexer {
  private input: string;
  private position: number = 0;
  private readPosition: number = 0;
  private char: string | null = null;
  private line: number = 1;
  private column: number = 0;

  constructor(input: string) {
    this.input = input;
    this.readChar();
  }

  public nextToken(): Token {
    throw new Error('Method not implemented.');
  }

  private readChar(): void {
  }

  private peekChar(): string | null {
    return null; // Placeholder
  }

  private skipWhitespace(): void {
  }

  private isLetter(char: string | null): boolean {
    return false; // Placeholder
  }

  private readIdentifier(): string {
    return ''; // Placeholder
  }

  private lookupIdentifier(identifier: string): TokenType {
    return TokenType.IDENTIFIER; // Placeholder
  }

  private isDigit(char: string | null): boolean {
    return false; // Placeholder
  }

  private readNumber(): string {
    return ''; // Placeholder
  }

  private readString(quoteType: '"' | "'"): string {
    return ''; // Placeholder
  }

}
