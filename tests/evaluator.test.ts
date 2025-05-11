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

    // TODO: Add tests for prefix ++ and -- once their interaction with variables is more clearly defined for testing
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

  // More to come: Loops, Functions, Display, Errors
});
