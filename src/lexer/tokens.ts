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
