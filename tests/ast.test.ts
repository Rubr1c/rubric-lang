import { Token, TokenType } from '../src/lexer/tokens';
import { Program } from '../src/ast/program';
import {
  Identifier,
  IntegerLiteral,
  FloatLiteral,
  StringLiteral,
  BooleanLiteral,
  PrefixExpression,
  PostfixExpression,
  InfixExpression,
  TernaryExpression,
} from '../src/ast/expressions';
import {
  VarStatement,
  ConstStatement,
  ReturnStatement,
  BlockStatement,
  IfStatement,
  ForStatement,
  WhileStatement,
  DoWhileStatement,
} from '../src/ast/statements';
import {
  CallExpression,
  FunctionLiteral,
  FunctionDeclaration,
} from '../src/ast/functions';
import { TypeNode } from '../src/ast/types';

describe('AST Nodes', () => {
  it('Identifier should return correct literal and string', () => {
    const tok: Token = { type: TokenType.IDENTIFIER, literal: 'foo' };
    const node = new Identifier(tok, 'foo');
    expect(node.tokenLiteral()).toBe('foo');
    expect(node.toString()).toBe('foo');
  });

  it('IntegerLiteral should return correct literal and string', () => {
    const tok: Token = { type: TokenType.INT, literal: '123' };
    const node = new IntegerLiteral(tok, 123);
    expect(node.tokenLiteral()).toBe('123');
    expect(node.toString()).toBe('123');
  });

  it('FloatLiteral should return correct literal and string', () => {
    const tok: Token = { type: TokenType.FLOAT, literal: '3.14' };
    const node = new FloatLiteral(tok, 3.14);
    expect(node.tokenLiteral()).toBe('3.14');
    expect(node.toString()).toBe('3.14');
  });

  it('StringLiteral should return correct literal and string', () => {
    const tok: Token = { type: TokenType.STRING, literal: 'hello' };
    const node = new StringLiteral(tok, 'hello');
    expect(node.tokenLiteral()).toBe('hello');
    expect(node.toString()).toBe('hello');
  });

  it('BooleanLiteral should return correct literal and string', () => {
    const tok: Token = { type: TokenType.BOOLEAN, literal: 'true' };
    const node = new BooleanLiteral(tok, true);
    expect(node.tokenLiteral()).toBe('true');
    expect(node.toString()).toBe('true');
  });

  it('PrefixExpression, PostfixExpression, InfixExpression, TernaryExpression should format correctly', () => {
    const aTok: Token = { type: TokenType.IDENTIFIER, literal: 'a' };
    const a = new Identifier(aTok, 'a');
    const fiveTok: Token = { type: TokenType.INT, literal: '5' };
    const five = new IntegerLiteral(fiveTok, 5);

    const prefix = new PrefixExpression(
      { type: TokenType.MINUS, literal: '-' },
      '-',
      a
    );
    expect(prefix.toString()).toBe('(-a)');

    const postfix = new PostfixExpression(
      { type: TokenType.INCREMENT, literal: '++' },
      a,
      '++'
    );
    expect(postfix.toString()).toBe('(a++)');

    const infix = new InfixExpression(
      { type: TokenType.PLUS, literal: '+' },
      a,
      '+',
      five
    );
    expect(infix.toString()).toBe('(a + 5)');

    const ternary = new TernaryExpression(
      { type: TokenType.QUESTION_MARK, literal: '?' },
      a,
      five,
      a
    );
    expect(ternary.toString()).toBe('(a ? 5 : a)');
  });

  it('VarStatement and ConstStatement should format declarations', () => {
    const varTok: Token = { type: TokenType.VAR, literal: 'var' };
    const constTok: Token = { type: TokenType.CONST, literal: 'const' };
    const name = new Identifier(
      { type: TokenType.IDENTIFIER, literal: 'x' },
      'x'
    );
    const value = new IntegerLiteral(
      { type: TokenType.INT, literal: '10' },
      10
    );

    const varStmt = new VarStatement(varTok, name, null, value);
    expect(varStmt.tokenLiteral()).toBe('var');
    expect(varStmt.toString()).toBe('var x = 10;');

    const constStmt = new ConstStatement(constTok, name, null, value);
    expect(constStmt.tokenLiteral()).toBe('const');
    expect(constStmt.toString()).toBe('const x = 10;');
  });

  it('ReturnStatement should format correctly', () => {
    const retTok: Token = {
      type: TokenType.RETURN_STATEMENT,
      literal: 'return',
    };
    const value = new IntegerLiteral({ type: TokenType.INT, literal: '0' }, 0);
    const stmt = new ReturnStatement(retTok, value);
    expect(stmt.tokenLiteral()).toBe('return');
    expect(stmt.toString()).toBe('return 0;');
  });

  it('BlockStatement should wrap statements', () => {
    const openTok: Token = { type: TokenType.LCURLY, literal: '{' };
    const stmt1 = new ReturnStatement(
      { type: TokenType.RETURN_STATEMENT, literal: 'return' },
      new Identifier({ type: TokenType.IDENTIFIER, literal: 'y' }, 'y')
    );
    const block = new BlockStatement(openTok, [stmt1]);
    expect(block.tokenLiteral()).toBe('{');
    expect(block.toString()).toBe('{ return y; }');
  });

  it('IfStatement should handle alternative and nested', () => {
    const ifTok: Token = { type: TokenType.IF_STATEMENT, literal: 'if' };
    const cond = new BooleanLiteral(
      { type: TokenType.BOOLEAN, literal: 'true' },
      true
    );
    const conseq = new BlockStatement(
      { type: TokenType.LCURLY, literal: '{' },
      []
    );
    const alt = new BlockStatement(
      { type: TokenType.LCURLY, literal: '{' },
      []
    );
    const stmt = new IfStatement(ifTok, cond, conseq, alt);
    expect(stmt.toString()).toBe(
      `if (${cond.toString()}) ${conseq.toString()} else ${alt.toString()}`
    );
  });

  it('CallExpression and FunctionLiteral should format correctly', () => {
    const callTok: Token = { type: TokenType.LPAREN, literal: '(' };
    const callee = new Identifier(
      { type: TokenType.IDENTIFIER, literal: 'foo' },
      'foo'
    );
    const arg = new IntegerLiteral({ type: TokenType.INT, literal: '1' }, 1);
    const call = new CallExpression(callTok, callee, [arg]);
    expect(call.tokenLiteral()).toBe('(');
    expect(call.toString()).toBe('foo(1)');

    const fnTok: Token = { type: TokenType.FUNCTION, literal: 'fn' };
    const body = new BlockStatement(
      { type: TokenType.LCURLY, literal: '{' },
      []
    );
    const returnTok: Token = { type: TokenType.TYPE_STRING, literal: 'void' };
    const returnType = new TypeNode(returnTok, 'void');
    const fnLit = new FunctionLiteral(
      fnTok,
      [callee],
      body,
      undefined,
      returnType
    );
    expect(fnLit.tokenLiteral()).toBe('fn');
    expect(fnLit.toString()).toContain('fn(foo)');
  });

  it('TypeNode should return correct string', () => {
    const tok: Token = { type: TokenType.TYPE_STRING, literal: 'string' };
    const typeNode = new TypeNode(tok, 'string');
    expect(typeNode.tokenLiteral()).toBe('string');
    expect(typeNode.toString()).toBe('string');
  });

  it('Program should hold statements', () => {
    const prog = new Program();
    expect(prog.tokenLiteral()).toBe('');
    const stmt = new ReturnStatement(
      { type: TokenType.RETURN_STATEMENT, literal: 'return' },
      null
    );
    prog.statements.push(stmt as any);
    expect(prog.tokenLiteral()).toBe('return');
    expect(prog.statements.length).toBe(1);
  });
});
