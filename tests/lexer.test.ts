import { Lexer } from '../src/lexer/lexer';
import { Token, TokenType } from '../src/lexer/tokens';

describe('Lexer', () => {
  interface ExpectedToken {
    type: TokenType;
    literal: string;
    line?: number; // Optional for now, can add more specific checks later
    column?: number; // Optional for now
  }

  function assertTokens(input: string, expectedTokens: ExpectedToken[]) {
    const lexer = new Lexer(input);
    expectedTokens.forEach((expectedToken, i) => {
      const actualToken = lexer.nextToken();
      expect(actualToken.type).toBe(expectedToken.type);
      expect(actualToken.literal).toBe(expectedToken.literal);
      // Add line/column checks if expectedToken has them defined
      if (expectedToken.line !== undefined) {
        expect(actualToken.line).toBe(expectedToken.line);
      }
      if (expectedToken.column !== undefined) {
        expect(actualToken.column).toBe(expectedToken.column);
      }
    });
    // Ensure EOF is the last token
    expect(lexer.nextToken().type).toBe(TokenType.EOF);
  }

  it('should tokenize single character operators and punctuation', () => {
    const input = '= : ; ( ) , + - * / % < > !';
    const expected: ExpectedToken[] = [
      { type: TokenType.EQUALS, literal: '=', line: 1, column: 1 },
      { type: TokenType.COLON, literal: ':', line: 1, column: 3 },
      { type: TokenType.SEMICOLON, literal: ';', line: 1, column: 5 },
      { type: TokenType.LPAREN, literal: '(', line: 1, column: 7 },
      { type: TokenType.RPAREN, literal: ')', line: 1, column: 9 },
      { type: TokenType.COMMA, literal: ',', line: 1, column: 11 },
      { type: TokenType.PLUS, literal: '+', line: 1, column: 13 },
      { type: TokenType.MINUS, literal: '-', line: 1, column: 15 },
      { type: TokenType.ASTERISK, literal: '*', line: 1, column: 17 },
      { type: TokenType.SLASH, literal: '/', line: 1, column: 19 },
      { type: TokenType.PERCENT, literal: '%', line: 1, column: 21 },
      { type: TokenType.LT, literal: '<', line: 1, column: 23 },
      { type: TokenType.GT, literal: '>', line: 1, column: 25 },
      { type: TokenType.BANG, literal: '!', line: 1, column: 27 },
    ];
    assertTokens(input, expected);
  });

  it('should tokenize identifiers and keywords', () => {
    const input = 'var myVar string bool int true false someIdent';
    const expected: ExpectedToken[] = [
      { type: TokenType.VAR, literal: 'var', line: 1, column: 1 },
      { type: TokenType.IDENTIFIER, literal: 'myVar', line: 1, column: 5 },
      { type: TokenType.TYPE_STRING, literal: 'string', line: 1, column: 11 },
      { type: TokenType.TYPE_BOOLEAN, literal: 'bool', line: 1, column: 18 },
      { type: TokenType.TYPE_INT, literal: 'int', line: 1, column: 23 },
      { type: TokenType.BOOLEAN, literal: 'true', line: 1, column: 27 },
      { type: TokenType.BOOLEAN, literal: 'false', line: 1, column: 32 },
      { type: TokenType.IDENTIFIER, literal: 'someIdent', line: 1, column: 38 },
    ];
    assertTokens(input, expected);
  });

  it('should tokenize INTs', () => {
    const input = '123 45670';
    const expected: ExpectedToken[] = [
      { type: TokenType.INT, literal: '123', line: 1, column: 1 },
      { type: TokenType.INT, literal: '45670', line: 1, column: 5 },
    ];
    assertTokens(input, expected);
  });

  it('should tokenize strings', () => {
    const input = '"hello world" \'another string\'';
    const expected: ExpectedToken[] = [
      { type: TokenType.STRING, literal: 'hello world', line: 1, column: 1 },
      {
        type: TokenType.STRING,
        literal: 'another string',
        line: 1,
        column: 15,
      },
    ];
    assertTokens(input, expected);
  });

  it('should handle empty input', () => {
    assertTokens('', []);
  });

  it('should tokenize illegal characters', () => {
    const input = '@#$';
    const expected: ExpectedToken[] = [
      { type: TokenType.ILLEGAL, literal: '@', line: 1, column: 1 },
      { type: TokenType.ILLEGAL, literal: '#', line: 1, column: 2 },
      { type: TokenType.ILLEGAL, literal: '$', line: 1, column: 3 },
    ];
    assertTokens(input, expected);
  });

  it('should tokenize a more complex line from demo.rl', () => {
    const input = 'print(a * b /3 % 2 < 4 > 3 ! 2 + 1);';
    const expected: ExpectedToken[] = [
      { type: TokenType.IDENTIFIER, literal: 'print', line: 1, column: 1 },
      { type: TokenType.LPAREN, literal: '(', line: 1, column: 6 },
      { type: TokenType.IDENTIFIER, literal: 'a', line: 1, column: 7 },
      { type: TokenType.ASTERISK, literal: '*', line: 1, column: 9 },
      { type: TokenType.IDENTIFIER, literal: 'b', line: 1, column: 11 },
      { type: TokenType.SLASH, literal: '/', line: 1, column: 13 },
      { type: TokenType.INT, literal: '3', line: 1, column: 14 },
      { type: TokenType.PERCENT, literal: '%', line: 1, column: 16 },
      { type: TokenType.INT, literal: '2', line: 1, column: 18 },
      { type: TokenType.LT, literal: '<', line: 1, column: 20 },
      { type: TokenType.INT, literal: '4', line: 1, column: 22 },
      { type: TokenType.GT, literal: '>', line: 1, column: 24 },
      { type: TokenType.INT, literal: '3', line: 1, column: 26 },
      { type: TokenType.BANG, literal: '!', line: 1, column: 28 },
      { type: TokenType.INT, literal: '2', line: 1, column: 30 }, // Note space after !
      { type: TokenType.PLUS, literal: '+', line: 1, column: 32 },
      { type: TokenType.INT, literal: '1', line: 1, column: 34 },
      { type: TokenType.RPAREN, literal: ')', line: 1, column: 35 },
      { type: TokenType.SEMICOLON, literal: ';', line: 1, column: 36 },
    ];
    assertTokens(input, expected);
  });

  it('should tokenize two-character operators', () => {
    const input = '== != <= >=';
    const expected: ExpectedToken[] = [
      { type: TokenType.EQUALS_EQUALS, literal: '==' },
      { type: TokenType.NOT_EQUALS, literal: '!=' },
      { type: TokenType.LT_EQUALS, literal: '<=' },
      { type: TokenType.GT_EQUALS, literal: '>=' },
    ];
    assertTokens(input, expected);
  });

  it('should tokenize increment and decrement operators', () => {
    const input = '++ --';
    const expected: ExpectedToken[] = [
      { type: TokenType.INCREMENT, literal: '++' },
      { type: TokenType.DECREMENT, literal: '--' },
    ];
    assertTokens(input, expected);
  });

  it('should tokenize braces', () => {
    const input = '{}';
    const expected: ExpectedToken[] = [
      { type: TokenType.LCURLY, literal: '{' },
      { type: TokenType.RCURLY, literal: '}' },
    ];
    assertTokens(input, expected);
  });

  it('should recognize control flow keywords', () => {
    const input = 'if else for while return';
    const expected: ExpectedToken[] = [
      { type: TokenType.IF_STATEMENT, literal: 'if' },
      { type: TokenType.ELSE_STATEMENT, literal: 'else' },
      { type: TokenType.FOR_STATEMENT, literal: 'for' },
      { type: TokenType.WHILE_STATEMENT, literal: 'while' },
      { type: TokenType.RETURN_STATEMENT, literal: 'return' },
    ];
    assertTokens(input, expected);
  });

  it('should skip single-line and block comments', () => {
    const input = `// line comment
var a=1;
/* block
comment */
var b=2;`;
    const expectedTokens: ExpectedToken[] = [
      { type: TokenType.VAR, literal: 'var' },
      { type: TokenType.IDENTIFIER, literal: 'a' },
      { type: TokenType.EQUALS, literal: '=' },
      { type: TokenType.INT, literal: '1' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.VAR, literal: 'var' },
      { type: TokenType.IDENTIFIER, literal: 'b' },
      { type: TokenType.EQUALS, literal: '=' },
      { type: TokenType.INT, literal: '2' },
      { type: TokenType.SEMICOLON, literal: ';' },
    ];
    assertTokens(input, expectedTokens);
  });
});
