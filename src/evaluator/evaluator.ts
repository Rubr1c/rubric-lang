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
  if (node === null) {
    return new NullValue(); // Explicitly return NullValue for null AST nodes
  }

  switch (true) {
    case node instanceof Program:
      return evalProgram(node, env);
    case node instanceof ExpressionStatement:
      return evaluate(node.expression, env);
    case node instanceof BlockStatement:
      return evalBlockStatement(node, env);
    case node instanceof IfStatement:
      return evalIfStatement(node, env);
    case node instanceof ForStatement:
      return evalForStatement(node, env);
    case node instanceof WhileStatement:
      return evalWhileStatement(node, env);
    case node instanceof DoWhileStatement:
      return evalDoWhileStatement(node, env);
    case node instanceof VarStatement:
      return evalVarStatement(node, env);
    case node instanceof ConstStatement:
      return evalConstStatement(node, env);
    case node instanceof ReturnStatement:
      const val = evaluate(node.returnValue, env);
      if (val instanceof ErrorValue) {
        return val;
      }
      return new ReturnValue(val === null ? new NullValue() : val);
    case node instanceof PrefixExpression:
      const prefixRight = evaluate(node.right, env);
      if (prefixRight instanceof ErrorValue) {
        return prefixRight;
      }
      if (prefixRight === null) {
        return new ErrorValue(
          'Operand for prefix expression evaluated to null.'
        );
      }
      return evalPrefixExpression(node.operator, prefixRight);
    case node instanceof InfixExpression:
      const infixLeft = evaluate(node.left, env);
      if (infixLeft instanceof ErrorValue) {
        return infixLeft;
      }
      const infixRight = evaluate(node.right, env);
      if (infixRight instanceof ErrorValue) {
        return infixRight;
      }
      if (infixLeft === null || infixRight === null) {
        return new ErrorValue(
          'Operand for infix expression evaluated to null.'
        );
      }
      return evalInfixExpression(node.operator, infixLeft, infixRight);
    case node instanceof Identifier:
      return evalIdentifier(node, env);
    case node instanceof IntegerLiteral:
      return new IntegerValue(node.value);
    case node instanceof FloatLiteral:
      return new FloatValue(node.value);
    case node instanceof BooleanLiteral:
      return new BooleanValue(node.value);
    case node instanceof StringLiteral:
      return new StringValue(node.value);
    case node instanceof FunctionLiteral:
      return new FunctionValue(node.params, node.body, env);
    case node instanceof CallExpression:
      const funcToCall = evaluate(node.func, env);
      if (funcToCall instanceof ErrorValue) {
        return funcToCall;
      }
      if (funcToCall === null || !(funcToCall instanceof FunctionValue)) {
        const typeStr = funcToCall === null ? 'null' : funcToCall.type();
        return new ErrorValue(`Cannot call non-function type: ${typeStr}`);
      }

      const evaluatedArgs = evalExpressions(node.args, env);
      const firstErrorArg = evaluatedArgs.find(
        (arg) => arg instanceof ErrorValue
      );
      if (firstErrorArg) {
        return firstErrorArg as ErrorValue;
      }

      return applyFunction(funcToCall, evaluatedArgs);
    default:
      const nodeConstructorName =
        (node as any)?.constructor?.name || 'UnknownType';
      return new ErrorValue(
        `Unsupported AST node type: ${nodeConstructorName}`
      );
  }
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
