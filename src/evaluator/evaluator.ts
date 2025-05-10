import {
  Program,
  Statement,
  ExpressionStatement,
  IntegerLiteral,
  FloatLiteral,
  BooleanLiteral,
  StringLiteral,
  PrefixExpression,
  InfixExpression,
  BlockStatement,
  IfStatement,
  ForStatement,
  WhileStatement,
  DoWhileStatement,
  FunctionLiteral,
  CallExpression,
  Identifier,
  VarStatement,
  ConstStatement,
  ReturnStatement,
  Expression,
  Node,
} from '../ast';
import {
  RuntimeObject,
  ObjectType,
  IntegerValue,
  FloatValue,
  BooleanValue,
  StringValue,
  NullValue,
  ReturnValue,
  ErrorValue,
  FunctionValue,
} from './objects';
import { Environment } from './environment';

// Evaluates an AST node and returns a runtime object.
export function evaluate(
  node: Node | null,
  env: Environment
): RuntimeObject | null {
  return null; // Placeholder
}

// Evaluates a program node.
function evalProgram(program: Program, env: Environment): RuntimeObject | null {
  return null; // Placeholder
}

// Evaluates a block statement.
function evalBlockStatement(
  block: BlockStatement,
  env: Environment
): RuntimeObject | null {
  return null; // Placeholder
}

// Evaluates an if statement.
function evalIfStatement(
  is: IfStatement,
  env: Environment
): RuntimeObject | null {
  return null; // Placeholder
}

// Evaluates a for statement.
function evalForStatement(
  fs: ForStatement,
  env: Environment
): RuntimeObject | null {
  return null; // Placeholder
}

// Evaluates a while statement.
function evalWhileStatement(
  ws: WhileStatement,
  env: Environment
): RuntimeObject | null {
  return null; // Placeholder
}

// Evaluates a do...while statement.
function evalDoWhileStatement(
  dws: DoWhileStatement,
  env: Environment
): RuntimeObject | null {
  return null; // Placeholder
}

// Evaluates an identifier.
function evalIdentifier(node: Identifier, env: Environment): RuntimeObject {
  return new ErrorValue('identifier not found: ' + node.value); // Placeholder
}

// Evaluates a prefix expression.
function evalPrefixExpression(
  operator: string,
  right: RuntimeObject | null
): RuntimeObject {
  return new NullValue(); // Placeholder
}

// Evaluates an infix expression.
function evalInfixExpression(
  operator: string,
  left: RuntimeObject | null,
  right: RuntimeObject | null
): RuntimeObject {
  return new NullValue(); // Placeholder
}

// Evaluates expressions.
function evalExpressions(
  exps: Expression[],
  env: Environment
): Array<RuntimeObject | null> {
  return []; // Placeholder
}

// Applies a function.
function applyFunction(
  fn: RuntimeObject,
  args: Array<RuntimeObject | null>
): RuntimeObject {
  return new NullValue(); // Placeholder
}

// Extends the function environment.
function extendFunctionEnv(
  fn: FunctionValue,
  args: Array<RuntimeObject | null>
): Environment {
  return new Environment(); // Placeholder
}

// Unwraps a return value.
function unwrapReturnValue(obj: RuntimeObject | null): RuntimeObject | null {
  return null; // Placeholder
}

// Evaluates a var statement.
function evalVarStatement(
  stmt: VarStatement,
  env: Environment
): RuntimeObject | null {
  return null; // Placeholder
}

// Evaluates a const statement.
function evalConstStatement(
  stmt: ConstStatement,
  env: Environment
): RuntimeObject | null {
  return null; // Placeholder
}
