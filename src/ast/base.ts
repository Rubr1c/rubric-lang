export interface Node {
  tokenLiteral(): string;
}

export interface Statement extends Node {}
export interface Expression extends Node {}
