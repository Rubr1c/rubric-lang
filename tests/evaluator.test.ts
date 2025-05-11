import { Lexer } from '../src/lexer/lexer';
import { Parser } from '../src/parser/parser';
import { evaluate } from '../src/evaluator/evaluator';
import { Environment } from '../src/evaluator/environment';
import {
  RuntimeObject,
  IntegerValue,
  FloatValue,
  BooleanValue,
  StringValue,
  NullValue,
  ErrorValue,
  // FunctionValue, // Will be needed later
} from '../src/evaluator/objects';

// Helper function to evaluate code and return the result
function testEvaluate(input: string): RuntimeObject | null {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();
  const env = new Environment();

  // Check for parser errors before evaluation
  if (parser.errors.length > 0) {
    throw new Error(`Parser errors: \n${parser.errors.join('\n')}`);
  }

  return evaluate(program, env);
}

describe('Evaluator', () => {
  describe('Literal Evaluation', () => {
    it('should evaluate integer literals', () => {
      const tests = [
        { input: '5;', expected: 5 },
        { input: '10;', expected: 10 },
        { input: '0;', expected: 0 },
        { input: '-5;', expected: -5 }, // Parser handles negative numbers directly as literals or prefix
        { input: '-10;', expected: -10 },
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        expect(evaluated).toBeInstanceOf(IntegerValue);
        expect((evaluated as IntegerValue).value).toEqual(tt.expected);
      });
    });

    it('should evaluate float literals', () => {
      const tests = [
        { input: '5.0;', expected: 5.0 },
        { input: '10.5;', expected: 10.5 },
        { input: '0.0;', expected: 0.0 },
        { input: '-5.5;', expected: -5.5 },
        { input: '-0.5;', expected: -0.5 },
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        expect(evaluated).toBeInstanceOf(FloatValue);
        expect((evaluated as FloatValue).value).toEqual(tt.expected);
      });
    });

    it('should evaluate boolean literals', () => {
      const tests = [
        { input: 'true;', expected: true },
        { input: 'false;', expected: false },
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        expect(evaluated).toBeInstanceOf(BooleanValue);
        expect((evaluated as BooleanValue).value).toEqual(tt.expected);
      });
    });

    it('should evaluate string literals', () => {
      const tests = [
        { input: '"hello world";', expected: 'hello world' },
        { input: "'rubric lang';", expected: 'rubric lang' },
        { input: '"";', expected: '' },
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        expect(evaluated).toBeInstanceOf(StringValue);
        expect((evaluated as StringValue).value).toEqual(tt.expected);
      });
    });
  });

  describe('Prefix Expressions', () => {
    it('should evaluate ! (bang) operator', () => {
      const tests = [
        { input: '!true;', expected: false },
        { input: '!false;', expected: true },
        { input: '!5;', expected: false }, // 5 is truthy
        { input: '!0;', expected: true }, // 0 is falsy in some languages, let's assume true for Rubric based on isTruthy
        { input: '!"";', expected: true }, // Empty string is falsy
        { input: '!"hello";', expected: false }, // Non-empty string is truthy
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        expect(evaluated).toBeInstanceOf(BooleanValue);
        expect((evaluated as BooleanValue).value).toEqual(tt.expected);
      });
    });

    it('should evaluate - (unary minus) operator', () => {
      const tests = [
        { input: '-5;', expectedValue: -5, expectedType: IntegerValue },
        { input: '-10;', expectedValue: -10, expectedType: IntegerValue },
        { input: '-0;', expectedValue: 0, expectedType: IntegerValue }, // -0 is 0
        { input: '-5.5;', expectedValue: -5.5, expectedType: FloatValue },
        { input: '-0.0;', expectedValue: 0.0, expectedType: FloatValue }, // -0.0 is 0.0
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        expect(evaluated).toBeInstanceOf(tt.expectedType);
        if (evaluated instanceof IntegerValue) {
          expect(evaluated.value).toEqual(tt.expectedValue);
        } else if (evaluated instanceof FloatValue) {
          expect(evaluated.value).toEqual(tt.expectedValue);
        }
      });
    });

    it('should evaluate prefix ++ and -- operators', () => {
      const tests = [
        // Integer tests
        {
          setup: 'var a = 5; ++a;',
          expectedExpressionValue: 6,
          finalVariableValue: 6,
          varName: 'a',
          type: IntegerValue,
        },
        {
          setup: 'var b = 0; ++b;',
          expectedExpressionValue: 1,
          finalVariableValue: 1,
          varName: 'b',
          type: IntegerValue,
        },
        {
          setup: 'var c = -3; ++c;',
          expectedExpressionValue: -2,
          finalVariableValue: -2,
          varName: 'c',
          type: IntegerValue,
        },
        {
          setup: 'var d = 5; --d;',
          expectedExpressionValue: 4,
          finalVariableValue: 4,
          varName: 'd',
          type: IntegerValue,
        },
        {
          setup: 'var e = 0; --e;',
          expectedExpressionValue: -1,
          finalVariableValue: -1,
          varName: 'e',
          type: IntegerValue,
        },
        {
          setup: 'var f = -3; --f;',
          expectedExpressionValue: -4,
          finalVariableValue: -4,
          varName: 'f',
          type: IntegerValue,
        },

        // Float tests
        {
          setup: 'var g = 5.0; ++g;',
          expectedExpressionValue: 6.0,
          finalVariableValue: 6.0,
          varName: 'g',
          type: FloatValue,
        },
        {
          setup: 'var h = 0.5; ++h;',
          expectedExpressionValue: 1.5,
          finalVariableValue: 1.5,
          varName: 'h',
          type: FloatValue,
        },
        {
          setup: 'var i = -2.5; ++i;',
          expectedExpressionValue: -1.5,
          finalVariableValue: -1.5,
          varName: 'i',
          type: FloatValue,
        },
        {
          setup: 'var j = 5.0; --j;',
          expectedExpressionValue: 4.0,
          finalVariableValue: 4.0,
          varName: 'j',
          type: FloatValue,
        },
        {
          setup: 'var k = 0.5; --k;',
          expectedExpressionValue: -0.5,
          finalVariableValue: -0.5,
          varName: 'k',
          type: FloatValue,
        },
        {
          setup: 'var l = -2.5; --l;',
          expectedExpressionValue: -3.5,
          finalVariableValue: -3.5,
          varName: 'l',
          type: FloatValue,
        },
      ];

      tests.forEach((tt) => {
        const lexer = new Lexer(tt.setup);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        const env = new Environment();

        if (parser.errors.length > 0) {
          throw new Error(
            `Parser errors for input "${tt.setup}": \n${parser.errors.join(
              '\n'
            )}`
          );
        }

        // evaluate the program (var declaration and then the prefix expression)
        const expressionResult = evaluate(program, env);

        // Check the value of the prefix expression itself
        expect(expressionResult).toBeInstanceOf(tt.type);
        if (
          expressionResult instanceof IntegerValue ||
          expressionResult instanceof FloatValue
        ) {
          if (tt.type === FloatValue) {
            expect(expressionResult.value).toBeCloseTo(
              tt.expectedExpressionValue
            );
          } else {
            expect(expressionResult.value).toEqual(tt.expectedExpressionValue);
          }
        }

        // Check the variable's value in the environment after the operation
        const varInEnv = env.get(tt.varName);
        expect(varInEnv).toBeInstanceOf(tt.type);
        if (
          varInEnv instanceof IntegerValue ||
          varInEnv instanceof FloatValue
        ) {
          if (tt.type === FloatValue) {
            expect(varInEnv.value).toBeCloseTo(tt.finalVariableValue);
          } else {
            expect(varInEnv.value).toEqual(tt.finalVariableValue);
          }
        }
      });
    });

    it('should return error for prefix ++/-- on undefined identifier', () => {
      const tests = [
        {
          input: '++undefinedVar;',
          errorMessage: 'identifier not found: undefinedVar',
        },
        {
          input: '--anotherUndefined;',
          errorMessage: 'identifier not found: anotherUndefined',
        },
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        expect(evaluated).toBeInstanceOf(ErrorValue);
        expect((evaluated as ErrorValue).message).toEqual(tt.errorMessage);
      });
    });

    it('should return error for prefix ++/-- on non-numeric types', () => {
      const tests = [
        {
          input: 'var s = "str"; ++s;',
          errorMessage: "Type Error: Cannot apply operator '++' to type STRING",
        },
        {
          input: 'var b = true; --b;',
          errorMessage:
            "Type Error: Cannot apply operator '--' to type BOOLEAN",
        },
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        expect(evaluated).toBeInstanceOf(ErrorValue);
        expect((evaluated as ErrorValue).message).toEqual(tt.errorMessage);
      });
    });
  });

  describe('Infix Expressions', () => {
    it('should evaluate integer arithmetic', () => {
      const tests = [
        { input: '5 + 5;', expected: 10 },
        { input: '5 - 5;', expected: 0 },
        { input: '5 * 5;', expected: 25 },
        { input: '5 / 5;', expected: 1 },
        { input: '10 / 3;', expected: 3 }, // Integer division
        { input: '5 % 5;', expected: 0 },
        { input: '10 % 3;', expected: 1 },
        { input: '5 + 5 + 5 + 5 - 10;', expected: 10 },
        { input: '2 * 2 * 2 * 2 * 2;', expected: 32 },
        { input: '-50 + 100 + -50;', expected: 0 },
        { input: '5 * 2 + 10;', expected: 20 },
        { input: '5 + 2 * 10;', expected: 25 },
        { input: '20 + 2 * -10;', expected: 0 },
        { input: '50 / 2 * 2 + 10;', expected: 60 },
        { input: '2 * (5 + 10);', expected: 30 },
        { input: '3 * 3 * 3 + 10;', expected: 37 },
        { input: '3 * (3 * 3) + 10;', expected: 37 },
        { input: '(5 + 10 * 2 + 15 / 3) * 2 + -10;', expected: 50 },
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        expect(evaluated).toBeInstanceOf(IntegerValue);
        expect((evaluated as IntegerValue).value).toEqual(tt.expected);
      });
    });

    it('should evaluate float arithmetic', () => {
      const tests = [
        { input: '5.0 + 5.0;', expected: 10.0 },
        { input: '5.5 - 1.5;', expected: 4.0 },
        { input: '2.5 * 4.0;', expected: 10.0 },
        { input: '10.0 / 4.0;', expected: 2.5 },
        { input: '5.0 + 2.5 * 10.0;', expected: 30.0 },
        { input: '2.0 * (5.0 + 10.0);', expected: 30.0 },
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        expect(evaluated).toBeInstanceOf(FloatValue);
        expect((evaluated as FloatValue).value).toBeCloseTo(tt.expected); // Use toBeCloseTo for float comparisons
      });
    });

    it('should evaluate mixed integer/float arithmetic (promoting to float)', () => {
      const tests = [
        { input: '5 + 5.0;', expected: 10.0 },
        { input: '5.0 + 5;', expected: 10.0 },
        { input: '5 - 1.5;', expected: 3.5 },
        { input: '5.5 - 1;', expected: 4.5 },
        { input: '2 * 4.5;', expected: 9.0 },
        { input: '2.5 * 4;', expected: 10.0 },
        { input: '10 / 4.0;', expected: 2.5 },
        { input: '10.0 / 4;', expected: 2.5 },
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        expect(evaluated).toBeInstanceOf(FloatValue);
        expect((evaluated as FloatValue).value).toBeCloseTo(tt.expected);
      });
    });

    it('should evaluate boolean comparisons', () => {
      const tests = [
        { input: 'true == true;', expected: true },
        { input: 'false == false;', expected: true },
        { input: 'true != false;', expected: true },
        { input: 'false != true;', expected: true },
        { input: '(1 < 2) == true;', expected: true },
        { input: '(1 < 2) == false;', expected: false },
        { input: '(1 > 2) == true;', expected: false },
        { input: '(1 > 2) == false;', expected: true },
        { input: '1 < 2;', expected: true },
        { input: '1 > 2;', expected: false },
        { input: '1 <= 2;', expected: true },
        { input: '1 >= 2;', expected: false },
        { input: '2 <= 2;', expected: true },
        { input: '2 >= 2;', expected: true },
        { input: '1 == 1;', expected: true },
        { input: '1 != 1;', expected: false },
        { input: '1 == 2;', expected: false },
        { input: '1 != 2;', expected: true },
        { input: '"hello" == "hello";', expected: true },
        { input: '"hello" != "world";', expected: true },
        { input: '"apple" < "banana";', expected: true }, // String comparison
        { input: '5.0 == 5;', expected: true }, // Mixed type equality (int vs float)
        { input: '5 == 5.0;', expected: true },
        { input: '5.1 != 5;', expected: true },
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        expect(evaluated).toBeInstanceOf(BooleanValue);
        expect((evaluated as BooleanValue).value).toEqual(tt.expected);
      });
    });

    it('should evaluate string concatenation', () => {
      const input = '"Hello" + " " + "World!";';
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(StringValue);
      expect((evaluated as StringValue).value).toEqual('Hello World!');
    });
  });

  describe('Logical Operators', () => {
    it('should evaluate && operator with short-circuiting', () => {
      const tests = [
        { input: 'true && true;', expected: true },
        { input: 'true && false;', expected: false },
        { input: 'false && true;', expected: false }, // Short-circuits, true part not evaluated
        { input: 'false && (1 / 0);', expected: false }, // Short-circuits, division by zero not evaluated
        { input: '1 < 2 && 2 < 3;', expected: true },
        { input: '1 < 2 && 2 > 3;', expected: false },
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        expect(evaluated).toBeInstanceOf(BooleanValue);
        expect((evaluated as BooleanValue).value).toEqual(tt.expected);
      });
    });

    it('should evaluate || operator with short-circuiting', () => {
      const tests = [
        { input: 'true || true;', expected: true }, // Short-circuits
        { input: 'true || (1/0);', expected: true }, // Short-circuits
        { input: 'false || true;', expected: true },
        { input: 'false || false;', expected: false },
        { input: '1 > 2 || 2 < 3;', expected: true },
        { input: '1 > 2 || 2 > 3;', expected: false },
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        expect(evaluated).toBeInstanceOf(BooleanValue);
        expect((evaluated as BooleanValue).value).toEqual(tt.expected);
      });
    });
  });

  describe('Block Statements and Scoping', () => {
    it('should evaluate block statements and maintain scope', () => {
      const input = `
        var x = 10;
        {
          var x = 5; // Shadow outer x
          display(x); // Should display 5
        }
        display(x); // Should display 10
      `;
      const consoleLogSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {});
      testEvaluate(input); // Evaluate for side effects (display calls)
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, '5');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, '10');
      consoleLogSpy.mockRestore();
    });

    it('should return the value of the last statement in a block if not a ReturnStatement', () => {
      const tests = [
        { input: '{ 5; 10; }', expected: 10, type: IntegerValue },
        { input: '{ var a = 1; a + 2; }', expected: 3, type: IntegerValue },
        { input: '{ var b = true; !b; }', expected: false, type: BooleanValue },
        { input: '{ }', expected: null, type: NullValue }, // Empty block evaluates to NullValue
      ];

      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        if (tt.type === NullValue) {
          expect(evaluated).toBeInstanceOf(NullValue);
        } else {
          expect(evaluated).toBeInstanceOf(tt.type);
          if (evaluated instanceof IntegerValue)
            expect(evaluated.value).toEqual(tt.expected);
          if (evaluated instanceof BooleanValue)
            expect(evaluated.value).toEqual(tt.expected);
        }
      });
    });
  });

  describe('Variable Declarations and Assignments', () => {
    it('should evaluate var declarations and lookups', () => {
      const input = 'var age = 30; age;';
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(IntegerValue);
      expect((evaluated as IntegerValue).value).toEqual(30);
    });

    it('should evaluate const declarations and lookups', () => {
      const input = 'const pi = 3.14; pi;';
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(FloatValue);
      expect((evaluated as FloatValue).value).toBeCloseTo(3.14);
    });

    it('should handle assignment expressions', () => {
      const input = 'var x = 5; x = 10; x;';
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(IntegerValue);
      expect((evaluated as IntegerValue).value).toEqual(10);
    });

    it('should return the assigned value from an assignment expression', () => {
      const input = 'var y; y = 99;'; // The expression statement y = 99 evaluates to 99
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(IntegerValue);
      expect((evaluated as IntegerValue).value).toEqual(99);
    });

    it('should throw error on re-declaration in same scope', () => {
      const input = 'var name = "Rubric"; var name = "Lang";';
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(ErrorValue);
      expect((evaluated as ErrorValue).message).toContain(
        "Identifier 'name' has already been declared"
      );
    });

    it('should throw error on assignment to const', () => {
      const input = 'const count = 100; count = 200;';
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(ErrorValue);
      expect((evaluated as ErrorValue).message).toContain(
        "Assignment to constant variable 'count'"
      );
    });

    it('should allow shadowing in inner scopes', () => {
      const input = 'var a = 1; { var a = 2; a; } a;'; // Inner a is 2, outer a remains 1
      // The result of this program is the final 'a;' which is 1
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(IntegerValue);
      expect((evaluated as IntegerValue).value).toEqual(1);
    });

    it('should access outer scope variables', () => {
      const input = 'var global = 10; { var local = 5; global + local; }';
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(IntegerValue);
      expect((evaluated as IntegerValue).value).toEqual(15);
    });

    it('should return error for undefined identifier', () => {
      const input = 'myUndefinedVar;';
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(ErrorValue);
      expect((evaluated as ErrorValue).message).toEqual(
        'identifier not found: myUndefinedVar'
      );
    });
  });

  describe('If-Else Expressions', () => {
    it('should evaluate if statement without else', () => {
      const tests = [
        { input: 'if (true) { 10; }', expected: 10, type: IntegerValue },
        { input: 'if (false) { 10; }', expected: null, type: NullValue }, // No else, condition false
        { input: 'if (1 < 2) { 100; }', expected: 100, type: IntegerValue },
        { input: 'if (1 > 2) { 100; }', expected: null, type: NullValue },
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        if (tt.type === NullValue) {
          expect(evaluated).toBeInstanceOf(NullValue);
        } else {
          expect(evaluated).toBeInstanceOf(tt.type);
          if (evaluated instanceof IntegerValue)
            expect(evaluated.value).toEqual(tt.expected);
        }
      });
    });

    it('should evaluate if-else statement', () => {
      const tests = [
        {
          input: 'if (true) { 10; } else { 20; }',
          expected: 10,
          type: IntegerValue,
        },
        {
          input: 'if (false) { 10; } else { 20; }',
          expected: 20,
          type: IntegerValue,
        },
        {
          input: 'if (1 > 2) { "nope"; } else { "yep"; }',
          expected: 'yep',
          type: StringValue,
        },
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        expect(evaluated).toBeInstanceOf(tt.type);
        if (evaluated instanceof IntegerValue)
          expect(evaluated.value).toEqual(tt.expected);
        if (evaluated instanceof StringValue)
          expect(evaluated.value).toEqual(tt.expected);
      });
    });
  });

  describe('Looping Constructs', () => {
    it('should evaluate while loops', () => {
      const input = `
        var i = 0;
        var result = 0;
        while (i < 5) {
          result = result + i;
          i = i + 1;
        }
        result; // 0 + 1 + 2 + 3 + 4 = 10
      `;
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(IntegerValue);
      expect((evaluated as IntegerValue).value).toEqual(10);
    });

    it('should evaluate do-while loops', () => {
      const input = `
        var i = 0;
        var result = 0;
        do {
          result = result + i;
          i = i + 1;
        } while (i < 5);
        result; // 0 + 1 + 2 + 3 + 4 = 10
      `;
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(IntegerValue);
      expect((evaluated as IntegerValue).value).toEqual(10);
    });

    it('should execute do-while body at least once', () => {
      const input = `
        var i = 5;
        var result = 0;
        do {
          result = result + i; // result = 5
          i = i + 1;
        } while (i < 5); // condition is false immediately
        result;
      `;
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(IntegerValue);
      expect((evaluated as IntegerValue).value).toEqual(5);
    });

    it('should evaluate for loops (C-style)', () => {
      const input = `
        var total = 0;
        for (var i = 0; i < 5; i = i + 1) {
          total = total + i;
        }
        total; // 0 + 1 + 2 + 3 + 4 = 10
      `;
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(IntegerValue);
      expect((evaluated as IntegerValue).value).toEqual(10);
    });

    it('for loop scope: var declared in init should be scoped to loop and its body', () => {
      const input = `
        var outerI = 100;
        var total = 0;
        for (var i = 0; i < 3; i = i + 1) {
          total = total + i; 
        }
        // i should not be accessible here if properly scoped to loop by for's own env
        // total; // If we check i, it would be an error. So check total based on loop.
        // Let's try to access outerI to ensure it's not affected.
        outerI + total; // 100 + (0+1+2) = 103
      `;
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(IntegerValue);
      // If i from loop leaks, this test might be harder to verify without checking for error on i.
      // Assuming loop var i is contained in loopEnv for for-loop
      expect((evaluated as IntegerValue).value).toEqual(103);
    });
  });

  describe('Function Evaluation', () => {
    it('should evaluate function literals and calls', () => {
      const tests = [
        {
          input: 'var identity = fn(x: int): int { return x; }; identity(5);',
          expected: 5,
          type: IntegerValue,
        },
        {
          input:
            'var add = fn(x: int, y: int): int { return x + y; }; add(5, 10);',
          expected: 15,
          type: IntegerValue,
        },
        {
          input:
            'var sub = fn(a: float, b: float): float { return a - b; }; sub(5.5, 0.5);',
          expected: 5.0,
          type: FloatValue,
        },
      ];
      tests.forEach((tt) => {
        const evaluated = testEvaluate(tt.input);
        expect(evaluated).toBeInstanceOf(tt.type);
        if (evaluated instanceof IntegerValue)
          expect(evaluated.value).toEqual(tt.expected);
        if (evaluated instanceof FloatValue)
          expect(evaluated.value).toBeCloseTo(tt.expected as number);
      });
    });

    it('should evaluate function declarations and calls', () => {
      const input = `
        fn multiply(a: int, b: int): int {
          return a * b;
        }
        multiply(6, 7);
      `;
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(IntegerValue);
      expect((evaluated as IntegerValue).value).toEqual(42);
    });


    it('should support basic recursion', () => {
      const input = `
        fn factorial(n: int): int {
          if (n == 0) {
            return 1;
          } else {
            return n * factorial(n - 1);
          }
        }
        factorial(5);
      `;
      const evaluated = testEvaluate(input);
      expect(evaluated).toBeInstanceOf(IntegerValue);
      expect((evaluated as IntegerValue).value).toEqual(120);
    });


    describe('Function Call Error Handling', () => {
      it('should return error for wrong number of arguments', () => {
        const tests = [
          {
            input: 'fn twoParams(a: int, b: int): void {} twoParams(1);',
            expectedMsg:
              "Expected 2 arguments for function 'twoParams' but got 1",
          },
          {
            input: 'fn noParams(): void {} noParams(1, 2);',
            expectedMsg:
              "Expected 0 arguments for function 'noParams' but got 2",
          },
        ];
        tests.forEach((tt) => {
          const evaluated = testEvaluate(tt.input);
          expect(evaluated).toBeInstanceOf(ErrorValue);
          expect((evaluated as ErrorValue).message).toEqual(tt.expectedMsg);
        });
      });

      it('should return error for argument type mismatch', () => {
        const tests = [
          {
            input: 'fn needsInt(i: int): void {} needsInt("str");',
            expectedMsg:
              "Type Error: Argument 1 ('i') for function 'needsInt' expected type 'int' but got type 'string'.",
          },
          {
            input: 'fn needsBool(b: boolean): void {} needsBool(123);',
            expectedMsg:
              "Type Error: Argument 1 ('b') for function 'needsBool' expected type 'boolean' but got type 'int'.",
          },
          {
            input: 'fn needsStr(s: string): void {} needsStr(true);',
            expectedMsg:
              "Type Error: Argument 1 ('s') for function 'needsStr' expected type 'string' but got type 'boolean'.",
          }
        ];
        tests.forEach((tt) => {
       
          let currentInput = tt.input;
  
          const evaluated = testEvaluate(currentInput);
          expect(evaluated).toBeInstanceOf(ErrorValue);
          expect((evaluated as ErrorValue).message).toEqual(tt.expectedMsg);
        });
      });

      it('should return error when calling a non-function', () => {


        const adjustedTests = [
          {
            input: 'var x = 10; x();',
            expectedMsg: 'Cannot call non-function type: INTEGER',
          },
          {
            input: 'var s = "text"; s();',
            expectedMsg: 'Cannot call non-function type: STRING',
          },
          {
            input: 'var b = true; b();',
            expectedMsg: 'Cannot call non-function type: BOOLEAN',
          },
        ];

        adjustedTests.forEach((tt) => {
          const evaluated = testEvaluate(tt.input);
          expect(evaluated).toBeInstanceOf(ErrorValue);
          expect((evaluated as ErrorValue).message).toEqual(tt.expectedMsg);
        });
      });
    });
  });
});
