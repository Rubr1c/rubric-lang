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
  LCURLY = '{',
  RCURLY = '}',
  COMMA = ',',
  PLUS = '+',
  MINUS = '-',
  ASTERISK = '*',
  SLASH = '/',
  PERCENT = '%',
  LT = '<',
  GT = '>',
  BANG = '!',

  IF_STATEMENT = 'IF_STATEMENT',
  ELSE_STATEMENT = 'ELSE_STATEMENT',
  FOR_STATEMENT = 'FOR_STATEMENT',
  WHILE_STATEMENT = 'WHITE_STATEMENT',
  RETURN_STATEMENT = 'RETURN_STATEMENT',

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
