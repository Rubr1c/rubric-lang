# Rubric Lang

Rubric Lang is a simple, dynamically-typed, interpreted programming language built with TypeScript. It's designed for educational purposes, demonstrating the core components of a language interpreter: a lexer, parser, and evaluator.

## Installation

To use Rubric Lang as a command-line tool, you can install it globally via npm (once published):

```bash
npm install -g rubric-lang
```

Make sure you have Node.js (version 14.0.0 or higher) installed.

## Usage

Once installed (or when running locally during development), you can execute Rubric Lang scripts:

```bash
rubric-lang path/to/your/script.rl
```

Or, for development using `ts-node`:

```bash
npm run dev path/to/your/script.rl
```

Rubric Lang files typically use the `.rl` extension.

## Features & Syntax

Rubric Lang supports the following core programming constructs:

### 1. Data Types & Literals

- **Integer**: `10`, `-5`, `0`
- **Float**: `3.14`, `-0.5`, `0.0`
- **Boolean**: `true`, `false`
- **String**: `"hello"`, `'world'` (double or single quotes)
- **Internal Null**: The language uses an internal `NullValue` for uninitialized variables or the result of empty blocks/void functions, but `null` is not a general-purpose literal or type keyword for direct use in variable declarations or annotations yet.

### 2. Variables

- **Declaration**:
  - `var identifier: type = value;` (e.g., `var age: int = 30;`)
  - `const identifier: type = value;` (e.g., `const pi: float = 3.14;`)
- **Type Annotations**: `: int`, `: float`, `: string`, `: boolean`, `: void`. Also accepts other identifiers as type names (e.g. `: any`) but complex type checking for these is not yet implemented.
- **Type Inference**: If an initializer is provided without a type annotation, the type is inferred (e.g., `var name = "Rubric";` infers `string`).
- **Uninitialized `var`**: `var x;` (defaults to type `any` and internal `NullValue`).
- **Assignment**: `identifier = newValue;` (only for `var`).

### 3. Operators

- **Arithmetic**: `+`, `-`, `*`, `/` (integer division for int/int, float otherwise), `%`
- **Comparison**: `==`, `!=`, `<`, `>`, `<=`, `>=`
- **Logical**: `&&` (short-circuiting AND), `||` (short-circuiting OR), `!` (NOT)
- **Increment/Decrement**: `++identifier` (prefix), `identifier++` (postfix), `--identifier`, `identifier--`
- **Ternary**: `condition ? expressionIfTrue : expressionIfFalse`

### 4. Control Flow

- **If-Else Statements**:
  ```rubric
  if (condition) {
    // ...
  } else if (otherCondition) {
    // ...
  } else {
    // ...
  }
  ```
- **For Loops**:
  ```rubric
  for (var i: int = 0; i < 10; i = i + 1) {
    // ...
  }
  ```
  (Initializer, condition, and update are all optional)
- **While Loops**:
  ```rubric
  while (condition) {
    // ...
  }
  ```
- **Do-While Loops**:
  ```rubric
  do {
    // ...
  } while (condition);
  ```

### 5. Functions

- **Declaration**:
  ```rubric
  fn functionName(param1: type, param2: type): returnType {
    // ... statements ...
    return value;
  }
  ```
- **Function Literals (Anonymous Functions)**:
  ```rubric
  var myFunc = fn(param: type): returnType {
    return param;
  };
  ```
- **Return Statement**: `return expression;` or `return;` (implicitly returns `NullValue`). The last expression in a block is also implicitly returned if no `return` statement is hit.
- **Recursion**: Supported.

### 6. Scoping

- **Lexical Scoping**.
- **Block Scope** for `var` and `const`.

### 7. Output

- `display(arg1, arg2, ...);` (prints arguments to console, space-separated).

### 8. Comments

- Single-line: `// comment`
- Block: `/* comment */`

## Development

1.  **Clone**: `git clone <repository-url>`
2.  **Install**: `npm install`
3.  **Build**: `npm run build` (compiles TypeScript to `dist`)
4.  **Test**: `npm test`
5.  **Run Demo File**: `npm run demo` (builds & runs `demo.rl`)
6.  **Dev Run**: `npm run dev path/to/script.rl` (uses `ts-node`)

## Future Enhancements

This list reflects some of the ideas previously discussed for future development:

- **Improved Type System**:
  - More robust type inference (e.g., for function call results).
  - Proper parsing and semantic analysis for complex function type signatures (e.g., `fn(int): fn(string):boolean`).
  - Explicit `null` type and nullable types (e.g., `int?`).
  - Arrays/Lists, Structs/Classes, Generics.
- **Language Features**:
  - Immediately Invoked Function Expressions (IIFEs).
  - String template literals.
- **Control Flow**: `switch`, `break`, `continue`.
- **Error Handling**: `try...catch`.
- **Modules**: Import/export system.
- **Standard Library**: More built-in functions.
