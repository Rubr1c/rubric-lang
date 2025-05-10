import { Lexer } from '../src/lexer/lexer';
import { Parser } from '../src/parser/parser';
import {
  Program,
  Statement,
  ExpressionStatement,
  Identifier,
  IntegerLiteral,
  AssignmentExpression,
  VarStatement,
  ConstStatement,
  InfixExpression,
  PrefixExpression,
  BooleanLiteral,
  StringLiteral,
  FloatLiteral,
  TypeNode,
  ReturnStatement,
  PostfixExpression,
  CallExpression,
  FunctionDeclaration,
  Param,
  BlockStatement,
  IfStatement,
  TernaryExpression,
  Expression,
  ForStatement,
  WhileStatement,
  DoWhileStatement,
  FunctionLiteral,
} from '../src/ast';

function checkParserErrors(parser: Parser): void {
  const errors = parser.errors;
  if (errors.length === 0) {
    return;
  }
  console.error(`Parser has ${errors.length} errors:`);
  errors.forEach((err, i) => {
    console.error(`Error ${i + 1}: ${err}`);
  });
  throw new Error('Parser errors encountered');
}

describe('Parser', () => {
  describe('AssignmentExpressions', () => {
    const tests = [
      {
        input: 'x = 5;',
        expectedIdentifier: 'x',
        expectedValue: 5,
      },
      {
        input: 'y = 10 + 5;',
        expectedIdentifier: 'y',
        expectedValue: '(10 + 5)',
      },
      {
        input: 'foobar = y;',
        expectedIdentifier: 'foobar',
        expectedValue: 'y',
      },
      // Test for right-associativity: a = b = c  should be parsed as a = (b = c)
      {
        input: 'a = b = 5;',
        expectedIdentifier: 'a',
        expectedValue: '(b = 5)', // Nested AssignmentExpression.toString() format
      },
      {
        input: 'a = b = c + 2;',
        expectedIdentifier: 'a',
        expectedValue: '(b = (c + 2))',
      },
    ];

    tests.forEach((tt) => {
      it(`parses assignment "${tt.input}" correctly`, () => {
        const l = new Lexer(tt.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        expect(program.statements.length).toBe(1);
        const stmt = program.statements[0];
        expect(stmt).toBeInstanceOf(ExpressionStatement);
        const exprStmt = stmt as ExpressionStatement;
        expect(exprStmt.expression).toBeInstanceOf(AssignmentExpression);

        const assignExpr = exprStmt.expression as AssignmentExpression;
        expect(assignExpr.name).toBeInstanceOf(Identifier);
        expect(assignExpr.name.value).toBe(tt.expectedIdentifier);
        expect(assignExpr.operator).toBe('=');

        if (typeof tt.expectedValue === 'number') {
          expect(assignExpr.value).toBeInstanceOf(IntegerLiteral);
          expect((assignExpr.value as IntegerLiteral).value).toBe(
            tt.expectedValue
          );
        } else if (typeof tt.expectedValue === 'string') {
          // For more complex expressions, we'll check the string representation
          // This is a simplification; more robust tests would check the AST structure deeply
          expect(assignExpr.value.toString()).toBe(tt.expectedValue);
        }
      });
    });
  });

  describe('VarStatement', () => {
    const tests = [
      {
        input: 'var x = 5;',
        expectedIdentifier: 'x',
        expectedValue: 5,
        expectedType: null,
      },
      {
        input: 'var y = true;',
        expectedIdentifier: 'y',
        expectedValue: true,
        expectedType: null,
      },
      {
        input: 'var foo = y;',
        expectedIdentifier: 'foo',
        expectedValue: 'y',
        expectedType: null,
      },
      {
        input: "var bar: string = 'hello';",
        expectedIdentifier: 'bar',
        expectedValue: 'hello',
        expectedType: 'string',
      },
      {
        input: 'var num: int = 100;',
        expectedIdentifier: 'num',
        expectedValue: 100,
        expectedType: 'int',
      },
      {
        input: 'var flt: float = 3.14;',
        expectedIdentifier: 'flt',
        expectedValue: 3.14,
        expectedType: 'float',
      },
      {
        input: 'var booly: boolean = false;',
        expectedIdentifier: 'booly',
        expectedValue: false,
        expectedType: 'boolean',
      },
      // Test without initializer
      {
        input: 'var x: int;',
        expectedIdentifier: 'x',
        expectedValue: null,
        expectedType: 'int',
      },
    ];

    tests.forEach((tt) => {
      it(`parses var statement "${tt.input}" correctly`, () => {
        const l = new Lexer(tt.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        expect(program.statements.length).toBe(1);
        const stmt = program.statements[0];
        expect(stmt).toBeInstanceOf(VarStatement);
        const varStmt = stmt as VarStatement;

        expect(varStmt.name).toBeInstanceOf(Identifier);
        expect(varStmt.name.value).toBe(tt.expectedIdentifier);

        if (tt.expectedType) {
          expect(varStmt.typeAnnotation).not.toBeNull();
          expect(varStmt.typeAnnotation).toBeInstanceOf(TypeNode);
          expect((varStmt.typeAnnotation as TypeNode).value).toBe(
            tt.expectedType
          );
        } else {
          expect(varStmt.typeAnnotation).toBeNull();
        }

        if (tt.expectedValue !== null) {
          expect(varStmt.value).not.toBeNull();
          testLiteralExpression(varStmt.value!, tt.expectedValue);
        } else {
          expect(varStmt.value).toBeNull();
        }
      });
    });
  });

  describe('ConstStatement', () => {
    const tests = [
      {
        input: 'const x = 5;',
        expectedIdentifier: 'x',
        expectedValue: 5,
        expectedType: null,
      },
      {
        input: "const bar: string = 'hello';",
        expectedIdentifier: 'bar',
        expectedValue: 'hello',
        expectedType: 'string',
      },
      // Const must have initializer - error cases should be tested separately if desired
    ];

    tests.forEach((tt) => {
      it(`parses const statement "${tt.input}" correctly`, () => {
        const l = new Lexer(tt.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        expect(program.statements.length).toBe(1);
        const stmt = program.statements[0];
        expect(stmt).toBeInstanceOf(ConstStatement);
        const constStmt = stmt as ConstStatement;

        expect(constStmt.name).toBeInstanceOf(Identifier);
        expect(constStmt.name.value).toBe(tt.expectedIdentifier);

        if (tt.expectedType) {
          expect(constStmt.typeAnnotation).not.toBeNull();
          expect(constStmt.typeAnnotation).toBeInstanceOf(TypeNode);
          expect((constStmt.typeAnnotation as TypeNode).value).toBe(
            tt.expectedType
          );
        } else {
          expect(constStmt.typeAnnotation).toBeNull();
        }

        expect(constStmt.value).not.toBeNull(); // Const must have a value
        testLiteralExpression(constStmt.value!, tt.expectedValue);
      });
    });
  });

  describe('ReturnStatement', () => {
    const tests = [
      { input: 'return 5;', expectedValue: 5 },
      { input: 'return true;', expectedValue: true },
      { input: 'return foobar;', expectedValue: 'foobar' },
      { input: 'return;', expectedValue: null }, // Test for return without a value
    ];

    tests.forEach((tt) => {
      it(`parses return statement "${tt.input}" correctly`, () => {
        // To test return statements, we need to parse them within a function scope
        const wrappedInput = `fn testFunc(): void { ${tt.input} }`;
        const l = new Lexer(wrappedInput);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        // Program -> FunctionDeclaration -> BlockStatement -> ReturnStatement
        expect(program.statements.length).toBe(1);
        const funcDecl = program.statements[0] as any; // Assuming FunctionDeclaration for simplicity
        expect(funcDecl.body.statements.length).toBe(1);
        const stmt = funcDecl.body.statements[0];

        expect(stmt).toBeInstanceOf(ReturnStatement);
        const returnStmt = stmt as ReturnStatement;

        if (tt.expectedValue !== null) {
          expect(returnStmt.returnValue).not.toBeNull();
          testLiteralExpression(returnStmt.returnValue!, tt.expectedValue);
        } else {
          expect(returnStmt.returnValue).toBeNull();
        }
      });
    });
  });

  describe('IdentifierExpression', () => {
    it('parses an identifier correctly', () => {
      const input = 'foobar;';
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const stmt = program.statements[0] as ExpressionStatement;
      expect(stmt).toBeInstanceOf(ExpressionStatement);
      const ident = stmt.expression as Identifier;
      expect(ident).toBeInstanceOf(Identifier);
      expect(ident.value).toBe('foobar');
      expect(ident.tokenLiteral()).toBe('foobar');
    });
  });

  describe('IntegerLiteralExpression', () => {
    it('parses an integer literal correctly', () => {
      const input = '5;';
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const stmt = program.statements[0] as ExpressionStatement;
      expect(stmt).toBeInstanceOf(ExpressionStatement);
      const literal = stmt.expression as IntegerLiteral;
      expect(literal).toBeInstanceOf(IntegerLiteral);
      expect(literal.value).toBe(5);
      expect(literal.tokenLiteral()).toBe('5');
    });
  });

  describe('FloatLiteralExpression', () => {
    it('parses a float literal correctly', () => {
      const input = '3.14159;';
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const stmt = program.statements[0] as ExpressionStatement;
      expect(stmt).toBeInstanceOf(ExpressionStatement);
      const literal = stmt.expression as FloatLiteral;
      expect(literal).toBeInstanceOf(FloatLiteral);
      expect(literal.value).toBe(3.14159);
      expect(literal.tokenLiteral()).toBe('3.14159');
    });
  });

  describe('StringLiteralExpression', () => {
    it('parses a string literal correctly', () => {
      const input = '"hello world";'; // String literals are enclosed in double quotes
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const stmt = program.statements[0] as ExpressionStatement;
      expect(stmt).toBeInstanceOf(ExpressionStatement);
      const literal = stmt.expression as StringLiteral;
      expect(literal).toBeInstanceOf(StringLiteral);
      expect(literal.value).toBe('hello world');
      expect(literal.tokenLiteral()).toBe('hello world');
    });
  });

  describe('BooleanLiteralExpression', () => {
    const tests = [
      { input: 'true;', expectedValue: true },
      { input: 'false;', expectedValue: false },
    ];
    tests.forEach((tt) => {
      it(`parses boolean literal "${tt.input}" correctly`, () => {
        const l = new Lexer(tt.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        expect(program.statements.length).toBe(1);
        const stmt = program.statements[0] as ExpressionStatement;
        expect(stmt).toBeInstanceOf(ExpressionStatement);
        const literal = stmt.expression as BooleanLiteral;
        expect(literal).toBeInstanceOf(BooleanLiteral);
        expect(literal.value).toBe(tt.expectedValue);
        expect(literal.tokenLiteral()).toBe(String(tt.expectedValue));
      });
    });
  });

  describe('PrefixExpression', () => {
    const tests = [
      { input: '!5;', operator: '!', value: 5 },
      { input: '-15;', operator: '-', value: 15 },
      { input: '!true;', operator: '!', value: true },
      { input: '!false;', operator: '!', value: false },
      { input: '++x;', operator: '++', value: 'x' }, // Pre-increment
      { input: '--y;', operator: '--', value: 'y' }, // Pre-decrement
    ];

    tests.forEach((tt) => {
      it(`parses prefix expression "${tt.input}" correctly`, () => {
        const l = new Lexer(tt.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        expect(program.statements.length).toBe(1);
        const stmt = program.statements[0] as ExpressionStatement;
        expect(stmt).toBeInstanceOf(ExpressionStatement);

        const expr = stmt.expression as PrefixExpression;
        expect(expr).toBeInstanceOf(PrefixExpression);
        expect(expr.operator).toBe(tt.operator);
        testLiteralExpression(expr.right, tt.value);
      });
    });
  });

  describe('PostfixExpression', () => {
    const tests = [
      { input: 'x++;', operator: '++', identifier: 'x' },
      { input: 'y--;', operator: '--', identifier: 'y' },
    ];

    tests.forEach((tt) => {
      it(`parses postfix expression "${tt.input}" correctly`, () => {
        const l = new Lexer(tt.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        expect(program.statements.length).toBe(1);
        const stmt = program.statements[0] as ExpressionStatement;
        expect(stmt).toBeInstanceOf(ExpressionStatement);

        const expr = stmt.expression as PostfixExpression;
        expect(expr).toBeInstanceOf(PostfixExpression);
        expect(expr.operator).toBe(tt.operator);
        expect(expr.left).toBeInstanceOf(Identifier);
        expect((expr.left as Identifier).value).toBe(tt.identifier);
      });
    });
  });

  describe('InfixExpression', () => {
    const tests = [
      // Arithmetic
      { input: '5 + 5;', leftValue: 5, operator: '+', rightValue: 5 },
      { input: '5 - 5;', leftValue: 5, operator: '-', rightValue: 5 },
      { input: '5 * 5;', leftValue: 5, operator: '*', rightValue: 5 },
      { input: '5 / 5;', leftValue: 5, operator: '/', rightValue: 5 },
      { input: '5 % 2;', leftValue: 5, operator: '%', rightValue: 2 },
      // Comparisons
      { input: '5 > 5;', leftValue: 5, operator: '>', rightValue: 5 },
      { input: '5 < 5;', leftValue: 5, operator: '<', rightValue: 5 },
      { input: '5 == 5;', leftValue: 5, operator: '==', rightValue: 5 },
      { input: '5 != 5;', leftValue: 5, operator: '!=', rightValue: 5 },
      { input: '5 >= 5;', leftValue: 5, operator: '>=', rightValue: 5 },
      { input: '5 <= 5;', leftValue: 5, operator: '<=', rightValue: 5 },
      // Boolean literals in infix expressions
      {
        input: 'true == true;',
        leftValue: true,
        operator: '==',
        rightValue: true,
      },
      {
        input: 'true != false;',
        leftValue: true,
        operator: '!=',
        rightValue: false,
      },
      {
        input: 'false == false;',
        leftValue: false,
        operator: '==',
        rightValue: false,
      },
      // Identifiers in infix expressions
      { input: 'a + b;', leftValue: 'a', operator: '+', rightValue: 'b' },
      {
        input: 'count <= 10;',
        leftValue: 'count',
        operator: '<=',
        rightValue: 10,
      },
    ];

    tests.forEach((tt) => {
      it(`parses infix expression "${tt.input}" correctly`, () => {
        const l = new Lexer(tt.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        expect(program.statements.length).toBe(1);
        const stmt = program.statements[0] as ExpressionStatement;
        expect(stmt).toBeInstanceOf(ExpressionStatement);

        const expr = stmt.expression as InfixExpression;
        expect(expr).toBeInstanceOf(InfixExpression);
        testLiteralExpression(expr.left, tt.leftValue);
        expect(expr.operator).toBe(tt.operator);
        testLiteralExpression(expr.right, tt.rightValue);
      });
    });
  });

  describe('Operator Precedence', () => {
    const tests = [
      // Basic precedence
      { input: '-a * b;', expected: '((-a) * b)' },
      { input: '!-a;', expected: '(!(-a))' },
      { input: 'a + b + c;', expected: '((a + b) + c)' }, // Left-associativity for + and -
      { input: 'a + b - c;', expected: '((a + b) - c)' },
      { input: 'a * b * c;', expected: '((a * b) * c)' }, // Left-associativity for * and /
      { input: 'a * b / c;', expected: '((a * b) / c)' },
      { input: 'a + b / c;', expected: '(a + (b / c))' },
      {
        input: 'a + b * c + d / e - f;',
        expected: '(((a + (b * c)) + (d / e)) - f)',
      },
      { input: '5 > 4 == 3 < 4;', expected: '((5 > 4) == (3 < 4))' },
      { input: '5 < 4 != 3 > 4;', expected: '((5 < 4) != (3 > 4))' },
      {
        input: '3 + 4 * 5 == 3 * 1 + 4 * 5;',
        expected: '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))',
      },
      { input: 'true == true;', expected: '(true == true)' },
      { input: 'false != true;', expected: '(false != true)' },
      // Parentheses for grouping
      { input: '1 + (2 + 3) + 4;', expected: '((1 + (2 + 3)) + 4)' },
      { input: '(5 + 5) * 2;', expected: '((5 + 5) * 2)' },
      { input: '2 / (5 + 5);', expected: '(2 / (5 + 5))' },
      { input: '-(5 + 5);', expected: '(-(5 + 5))' },
      { input: '!(true == true);', expected: '(!(true == true))' },
      // Call expressions
      { input: 'a + add(b * c) + d;', expected: '((a + add((b * c))) + d)' },
      {
        input: 'add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8));',
        expected: 'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))',
      },
      {
        input: 'add(a + b + c * d / f + g);',
        expected: 'add((((a + b) + ((c * d) / f)) + g))',
      },
      // Assignment and precedence
      { input: 'a = b + c;', expected: '(a = (b + c))' },
      { input: 'a = b = c + d;', expected: '(a = (b = (c + d)))' }, // Right-associativity of assignment
      // { input: 'a * b = c;', expected: '((a * b) = c)' }, // This now correctly causes a parser error
      // Ternary operator tests
      { input: 'a ? b : c;', expected: '(a ? b : c)' },
      {
        input: 'a + b ? c * d : e + f;',
        expected: '((a + b) ? (c * d) : (e + f))',
      },
      { input: 'a ? b ? c : d : e;', expected: '(a ? (b ? c : d) : e)' }, // Ternary is right-associative
      { input: 'a = b ? c : d;', expected: '(a = (b ? c : d))' },
      { input: 'a ? b : c = d;', expected: '(a ? b : (c = d))' }, // Assignment has lower precedence than ternary here
      // Postfix increment/decrement with other operators
      { input: 'a++ * b;', expected: '((a++) * b)' },
      { input: 'a * b++;', expected: '(a * (b++))' },
      { input: '-a++;', expected: '(-(a++))' }, // Postfix has higher precedence than prefix minus
    ];

    tests.forEach((tt) => {
      it(`correctly parses operator precedence for "${tt.input}"`, () => {
        const l = new Lexer(tt.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        expect(program.statements.length).toBe(1);
        const stmt = program.statements[0] as ExpressionStatement;
        expect(stmt.expression.toString()).toBe(tt.expected);
      });
    });
  });

  describe('Parser Error Handling', () => {
    it('should report an error for invalid assignment target (e.g. expression = value)', () => {
      const input = 'a * b = c;';
      const l = new Lexer(input);
      const p = new Parser(l);
      p.parseProgram(); // We don't check the program output here, just the errors
      expect(p.errors.length).toBeGreaterThanOrEqual(1);
      expect(p.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Invalid assignment target'),
        ])
      );
    });

    // Add more specific error tests here
  });

  describe('CallExpression', () => {
    it('parses a call expression correctly', () => {
      const input = 'add(1, 2 * 3, 4 + 5);';
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const stmt = program.statements[0] as ExpressionStatement;
      expect(stmt).toBeInstanceOf(ExpressionStatement);

      const expr = stmt.expression as CallExpression;
      expect(expr).toBeInstanceOf(CallExpression);
      expect(expr.func).toBeInstanceOf(Identifier);
      expect((expr.func as Identifier).value).toBe('add');

      expect(expr.args.length).toBe(3);
      testLiteralExpression(expr.args[0], 1);
      // For infix expressions as arguments, we test their string representation
      expect(expr.args[1].toString()).toBe('(2 * 3)');
      expect(expr.args[2].toString()).toBe('(4 + 5)');
    });

    it('parses a call expression with no arguments', () => {
      const input = 'getTime();';
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const stmt = program.statements[0] as ExpressionStatement;
      const expr = stmt.expression as CallExpression;
      expect(expr).toBeInstanceOf(CallExpression);
      expect((expr.func as Identifier).value).toBe('getTime');
      expect(expr.args.length).toBe(0);
    });
  });

  describe('FunctionDeclarationStatement', () => {
    const tests = [
      {
        input: 'fn myFunction(x: int, y: string): boolean { return x > 0; }',
        expectedName: 'myFunction',
        expectedParams: [
          { name: 'x', type: 'int' },
          { name: 'y', type: 'string' },
        ],
        expectedReturnType: 'boolean',
        expectedBodyContains: 'return (x > 0);',
      },
      {
        input: 'fn noParams(): void { }',
        expectedName: 'noParams',
        expectedParams: [],
        expectedReturnType: 'void',
        expectedBodyContains: ' ', // Empty block statement has a space in its toString()
      },
      {
        input:
          'fn add(a: float, b: float): float { var result = a + b; return result; }',
        expectedName: 'add',
        expectedParams: [
          { name: 'a', type: 'float' },
          { name: 'b', type: 'float' },
        ],
        expectedReturnType: 'float',
        expectedBodyContains: 'var result = (a + b);return result;',
      },
    ];

    tests.forEach((tt) => {
      it(`parses function declaration "${tt.input.substring(
        0,
        30
      )}..." correctly`, () => {
        const l = new Lexer(tt.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        expect(program.statements.length).toBe(1);
        const stmt = program.statements[0] as FunctionDeclaration;
        expect(stmt).toBeInstanceOf(FunctionDeclaration);

        expect(stmt.name.value).toBe(tt.expectedName);
        expect(stmt.params.length).toBe(tt.expectedParams.length);
        tt.expectedParams.forEach((expectedParam, i) => {
          const paramNode = stmt.params[i];
          expect(paramNode).toBeInstanceOf(Param);
          const param = paramNode as Param;
          expect(param.value).toBe(expectedParam.name);
          expect(param.type.value).toBe(expectedParam.type);
        });

        if (stmt.returnType) {
          expect(stmt.returnType).toBeInstanceOf(TypeNode);
          expect(stmt.returnType.value).toBe(tt.expectedReturnType);
        } else if (tt.expectedReturnType) {
          throw new Error(
            `Expected return type ${tt.expectedReturnType} but got undefined`
          );
        }

        expect(stmt.body).toBeInstanceOf(BlockStatement);
        // Basic check for body content, more detailed checks can be added if needed
        expect(stmt.body.toString().replace(/\s+/g, '')).toContain(
          tt.expectedBodyContains.replace(/\s+/g, '')
        );
      });
    });
  });

  describe('IfStatement', () => {
    it('parses an if statement with only consequence', () => {
      const input = 'if (x < y) { x = y; }';
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const stmt = program.statements[0] as IfStatement;
      expect(stmt).toBeInstanceOf(IfStatement);
      expect(stmt.condition.toString()).toBe('(x < y)');
      expect(stmt.consequence).toBeInstanceOf(BlockStatement);
      expect(stmt.consequence.statements.length).toBe(1);
      expect(
        (
          stmt.consequence.statements[0] as ExpressionStatement
        ).expression.toString()
      ).toBe('(x = y)');
      expect(stmt.alternative).toBeUndefined();
    });

    it('parses an if-else statement', () => {
      const input = 'if (x < y) { x; } else { y; }';
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const stmt = program.statements[0] as IfStatement;
      expect(stmt).toBeInstanceOf(IfStatement);
      expect(stmt.condition.toString()).toBe('(x < y)');
      expect(stmt.consequence).toBeInstanceOf(BlockStatement);
      expect(stmt.consequence.statements.length).toBe(1);
      expect(
        (
          stmt.consequence.statements[0] as ExpressionStatement
        ).expression.toString()
      ).toBe('x');

      expect(stmt.alternative).toBeInstanceOf(BlockStatement);
      expect((stmt.alternative as BlockStatement).statements.length).toBe(1);
      expect(
        (
          (stmt.alternative as BlockStatement)
            .statements[0] as ExpressionStatement
        ).expression.toString()
      ).toBe('y');
    });

    it('parses an if-else if-else statement', () => {
      const input = 'if (x < y) { x; } else if (x > y) { y; } else { z; }';
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const stmt = program.statements[0] as IfStatement;
      expect(stmt).toBeInstanceOf(IfStatement);
      expect(stmt.condition.toString()).toBe('(x < y)');
      expect(stmt.consequence.statements.length).toBe(1);

      const elseIfStmt = stmt.alternative as IfStatement;
      expect(elseIfStmt).toBeInstanceOf(IfStatement);
      expect(elseIfStmt.condition.toString()).toBe('(x > y)');
      expect(elseIfStmt.consequence.statements.length).toBe(1);

      expect(elseIfStmt.alternative).toBeInstanceOf(BlockStatement);
      expect((elseIfStmt.alternative as BlockStatement).statements.length).toBe(
        1
      );
      expect(
        (
          (elseIfStmt.alternative as BlockStatement)
            .statements[0] as ExpressionStatement
        ).expression.toString()
      ).toBe('z');
    });
  });

  describe('TernaryExpression', () => {
    it('parses a ternary expression correctly', () => {
      const input = 'a > b ? 10 : 20;';
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const stmt = program.statements[0] as ExpressionStatement;
      expect(stmt).toBeInstanceOf(ExpressionStatement);

      const expr = stmt.expression as TernaryExpression;
      expect(expr).toBeInstanceOf(TernaryExpression);
      expect(expr.condition.toString()).toBe('(a > b)');
      testLiteralExpression(expr.consequent, 10);
      testLiteralExpression(expr.alternate, 20);
    });
  });

  describe('ForStatement', () => {
    it('parses a full for statement correctly', () => {
      const input = 'for (var i = 0; i < 10; i = i + 1) { i; }';
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const stmt = program.statements[0] as ForStatement;
      expect(stmt).toBeInstanceOf(ForStatement);

      // Check initializer (var i = 0;)
      expect(stmt.init).toBeInstanceOf(VarStatement);
      const initVarStmt = stmt.init as VarStatement;
      expect(initVarStmt.name.value).toBe('i');
      testLiteralExpression(initVarStmt.value!, 0);

      // Check condition (i < 10)
      expect(stmt.condition).toBeInstanceOf(InfixExpression);
      const condExpr = stmt.condition as InfixExpression;
      testLiteralExpression(condExpr.left, 'i');
      expect(condExpr.operator).toBe('<');
      testLiteralExpression(condExpr.right, 10);

      // Check update (i = i + 1)
      expect(stmt.update).toBeInstanceOf(AssignmentExpression);
      const updateExpr = stmt.update as AssignmentExpression;
      expect(updateExpr.name.value).toBe('i');
      expect(updateExpr.value).toBeInstanceOf(InfixExpression);
      const updateInfix = updateExpr.value as InfixExpression;
      testLiteralExpression(updateInfix.left, 'i');
      expect(updateInfix.operator).toBe('+');
      testLiteralExpression(updateInfix.right, 1);

      // Check body
      expect(stmt.body).toBeInstanceOf(BlockStatement);
      expect(stmt.body.statements.length).toBe(1);
      const bodyStmt = stmt.body.statements[0] as ExpressionStatement;
      expect((bodyStmt.expression as Identifier).value).toBe('i');
    });

  });

  describe('WhileStatement', () => {
    it('parses a while statement correctly', () => {
      const input = 'while (x < 10) { x = x + 1; }';
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const stmt = program.statements[0] as WhileStatement;
      expect(stmt).toBeInstanceOf(WhileStatement);

      expect(stmt.condition).toBeInstanceOf(InfixExpression);
      const condExpr = stmt.condition as InfixExpression;
      testLiteralExpression(condExpr.left, 'x');
      expect(condExpr.operator).toBe('<');
      testLiteralExpression(condExpr.right, 10);

      expect(stmt.body).toBeInstanceOf(BlockStatement);
      expect(stmt.body.statements.length).toBe(1);
      const bodyStmt = stmt.body.statements[0] as ExpressionStatement;
      expect(bodyStmt.expression).toBeInstanceOf(AssignmentExpression);
    });
  });

  describe('DoWhileStatement', () => {
    it('parses a do-while statement correctly', () => {
      const input = 'do { x = x + 1; } while (x < 10);';
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const stmt = program.statements[0] as DoWhileStatement;
      expect(stmt).toBeInstanceOf(DoWhileStatement);

      expect(stmt.body).toBeInstanceOf(BlockStatement);
      expect(stmt.body.statements.length).toBe(1);
      const bodyStmt = stmt.body.statements[0] as ExpressionStatement;
      expect(bodyStmt.expression).toBeInstanceOf(AssignmentExpression);

      expect(stmt.condition).toBeInstanceOf(InfixExpression);
      const condExpr = stmt.condition as InfixExpression;
      testLiteralExpression(condExpr.left, 'x');
      expect(condExpr.operator).toBe('<');
      testLiteralExpression(condExpr.right, 10);
    });
  });

  describe('FunctionLiteralExpression', () => {
    it('parses an anonymous function assigned to a variable (explicit void return)', () => {
      const input = 'var myFunc = fn(): void { return; };';
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const varStmt = program.statements[0] as VarStatement;
      expect(varStmt).toBeInstanceOf(VarStatement);
      expect(varStmt.name.value).toBe('myFunc');
      expect(varStmt.value).toBeInstanceOf(FunctionLiteral);

      const fnLiteral = varStmt.value as FunctionLiteral;
      expect(fnLiteral.params.length).toBe(0);
      expect(fnLiteral.returnType).toBeInstanceOf(TypeNode);
      expect(fnLiteral.returnType!.value).toBe('void');
      expect(fnLiteral.body.statements.length).toBe(1);
      expect(fnLiteral.body.statements[0]).toBeInstanceOf(ReturnStatement);
    });

    it('parses an anonymous function assigned to a variable (implicit void return)', () => {
      const input = 'var doSomething = fn(a: int) { a = a + 1; };';
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const varStmt = program.statements[0] as VarStatement;
      expect(varStmt.name.value).toBe('doSomething');
      expect(varStmt.value).toBeInstanceOf(FunctionLiteral);

      const fnLiteral = varStmt.value as FunctionLiteral;
      expect(fnLiteral.params.length).toBe(1);
      expect(fnLiteral.params[0].value).toBe('a');
      expect(fnLiteral.returnType).toBeInstanceOf(TypeNode);
      expect(fnLiteral.returnType!.value).toBe('void'); // Should default to void
      expect(fnLiteral.body.statements.length).toBe(1);
    });

    it('parses an anonymous function with parameters and return type', () => {
      const input = 'var add = fn(a: int, b: int): int { return a + b; };';
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const varStmt = program.statements[0] as VarStatement;
      expect(varStmt.value).toBeInstanceOf(FunctionLiteral);
      const fnLiteral = varStmt.value as FunctionLiteral;

      expect(fnLiteral.params.length).toBe(2);
      expect(fnLiteral.params[0].value).toBe('a');
      expect(fnLiteral.params[1].value).toBe('b');
      expect(fnLiteral.returnType).toBeInstanceOf(TypeNode);
      expect(fnLiteral.returnType!.value).toBe('int');
      expect(fnLiteral.body.statements.length).toBe(1);
    });

    it('parses an IIFE in an if condition', () => {
      const input =
        'if (fn(val: int): boolean { return val > 0; }(5)) { true; }';
      const l = new Lexer(input);
      const p = new Parser(l);
      const program = p.parseProgram();
      checkParserErrors(p);

      expect(program.statements.length).toBe(1);
      const ifStmt = program.statements[0] as IfStatement;
      expect(ifStmt).toBeInstanceOf(IfStatement);
      expect(ifStmt.condition).toBeInstanceOf(CallExpression);

      const callExpr = ifStmt.condition as CallExpression;
      expect(callExpr.func).toBeInstanceOf(FunctionLiteral);
      const fnLit = callExpr.func as FunctionLiteral;
      expect(fnLit.params.length).toBe(1);
      expect(fnLit.params[0].value).toBe('val');
      expect(fnLit.returnType).toBeInstanceOf(TypeNode);
      expect(fnLit.returnType!.value).toBe('boolean');

      expect(callExpr.args.length).toBe(1);
      testLiteralExpression(callExpr.args[0], 5);

      expect(ifStmt.consequence.statements.length).toBe(1);
      expect(
        (ifStmt.consequence.statements[0] as ExpressionStatement).expression
      ).toBeInstanceOf(BooleanLiteral);
    });
  });
});

// Helper function to test literal expressions
function testLiteralExpression(exp: Expression, expected: any): void {
  if (typeof expected === 'number') {
    if (Number.isInteger(expected)) {
      expect(exp).toBeInstanceOf(IntegerLiteral);
      expect((exp as IntegerLiteral).value).toBe(expected);
    } else {
      expect(exp).toBeInstanceOf(FloatLiteral);
      expect((exp as FloatLiteral).value).toBe(expected);
    }
  } else if (typeof expected === 'boolean') {
    expect(exp).toBeInstanceOf(BooleanLiteral);
    expect((exp as BooleanLiteral).value).toBe(expected);
  } else if (typeof expected === 'string') {
    // Could be Identifier or StringLiteral
    if (exp instanceof Identifier) {
      expect(exp.value).toBe(expected);
    } else {
      expect(exp).toBeInstanceOf(StringLiteral);
      expect((exp as StringLiteral).value).toBe(expected);
    }
  } else {
    throw new Error(`Unhandled expected type: ${typeof expected}`);
  }
}
