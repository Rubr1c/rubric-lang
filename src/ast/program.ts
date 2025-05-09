import { Node, Statement } from './base';

export class Program implements Node {
  public statements: Statement[] = [];

  tokenLiteral(): string {
    return this.statements.length > 0 ? this.statements[0].tokenLiteral() : '';
  }
}
