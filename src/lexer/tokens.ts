export enum TokenType {
  VAR = 'VAR',

  IDENTIFIER = 'IDENTIFIER',
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',

  EQUALS = '=',
  COLON = ':',
  SEMICOLON = ';',
  LPAREN = '(',
  RPAREN = ')',
  COMMA = ',',
  PLUS = '+',
  MINUS = '-',
  ASTERISK = '*',
  SLASH = '/',
  PERCENT = '%',
  LT = '<',
  GT = '>',
  BANG = '!',
  COMMENT = 'COMMENT',
  BLOCK_COMMENT = 'BLOCK_COMMENT',

  TYPE_STRING = 'TYPE_STRING',
  TYPE_INT = 'TYPE_INT',
  TYPE_BOOLEAN = 'TYPE_BOOLEAN',

  ILLEGAL = 'ILLEGAL',
  EOF = 'EOF',
}

export interface Token {
  type: TokenType;
  literal: string;
  line?: number;
  column?: number;
}
