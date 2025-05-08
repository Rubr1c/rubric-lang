export enum TokenType {
  VAR = 'VAR',

  IDENTIFIER = 'IDENTIFIER',
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',

  EQUALS = '=',
  COLON = ':',
  SEMICOLON = ';',

  TYPE_STRING = 'TYPE_STRING',
  TYPE_NUMBER = 'TYPE_NUMBER',
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
