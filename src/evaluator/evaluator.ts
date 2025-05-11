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
  PostfixExpression,
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
  AssignmentExpression,
  FunctionDeclaration,
  DisplayStatement,
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
import { isTruthy } from './utils';

// Evaluates an AST node and returns a runtime object.
export function evaluate(
  node: Node | null,
  env: Environment
): RuntimeObject | null {
  if (node === null) {
    return new NullValue();
  }

  switch (true) {
    case node instanceof Program:
      return evalProgram(node, env);
    case node instanceof ExpressionStatement:
      return evalExpressionStatementNode(node, env);
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
      return evalReturnStatementNode(node, env);
    case node instanceof AssignmentExpression:
      return evalAssignmentExpressionNode(node, env);
    case node instanceof PrefixExpression:
      return evalPrefixExpressionNode(node, env);
    case node instanceof InfixExpression:
      return evalInfixExpressionNode(node, env);
    case node instanceof PostfixExpression:
      return evalPostfixExpressionNode(node, env);
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
      return evalFunctionLiteralNode(node, env);
    case node instanceof CallExpression:
      return evalCallExpressionNode(node, env);
    case node instanceof FunctionDeclaration:
      return evalFunctionDeclarationStatementNode(node, env);
    case node instanceof DisplayStatement:
      return evalDisplayStatementNode(node, env);
    default:
      const nodeConstructorName =
        (node as any)?.constructor?.name || 'UnknownType';
      return new ErrorValue(
        `Unsupported AST node type: ${nodeConstructorName}`
      );
  }
}

// Evaluates a program node.
function evalProgram(program: Program, env: Environment): RuntimeObject {
  let lastResult: RuntimeObject = new NullValue();

  for (const statement of program.statements) {
    const currentStatementResult = evaluate(statement, env);

    if (currentStatementResult instanceof ErrorValue) {
      return currentStatementResult;
    }

    if (currentStatementResult instanceof ReturnValue) {
      return currentStatementResult;
    }

    lastResult = currentStatementResult ?? new NullValue();
  }
  return lastResult;
}

// Evaluates a block statement.
function evalBlockStatement(
  block: BlockStatement,
  outerEnv: Environment
): RuntimeObject | null {
  const blockEnv = new Environment(outerEnv);

  let lastResult = new NullValue();

  for (const statement of block.statements) {
    const currentStatementResult = evaluate(statement, blockEnv);

    if (currentStatementResult instanceof ErrorValue) {
      return currentStatementResult;
    }

    if (currentStatementResult instanceof ReturnValue) {
      return currentStatementResult;
    }

    lastResult = currentStatementResult ?? new NullValue();
  }

  return lastResult;
}

// Evaluates an if statement.
function evalIfStatement(
  is: IfStatement,
  env: Environment
): RuntimeObject | null {
  const conditionResult = evaluate(is.condition, env);

  if (conditionResult instanceof ErrorValue) {
    return conditionResult;
  }

  if (isTruthy(conditionResult)) {
    return evaluate(is.consequence, env);
  } else if (is.alternative) {
    return evaluate(is.alternative, env);
  }

  return new NullValue();
}

// Evaluates a for statement.
function evalForStatement(
  fs: ForStatement,
  env: Environment
): RuntimeObject | null {
  const loopEnv = new Environment(env);

  // 1. INITIALIZER
  if (fs.init) {
    const initResult = evaluate(fs.init, loopEnv);
    if (initResult instanceof ErrorValue) {
      return initResult;
    }
  }

  while (true) {
    let conditionIsTrue = true;
    if (fs.condition) {
      const conditionEvalResult = evaluate(fs.condition, loopEnv);
      if (conditionEvalResult instanceof ErrorValue) {
        return conditionEvalResult;
      }
      if (!isTruthy(conditionEvalResult)) {
        conditionIsTrue = false;
      }
    }

    if (!conditionIsTrue) {
      break;
    }

    const bodyResult = evaluate(fs.body, loopEnv);

    if (bodyResult instanceof ErrorValue) {
      return bodyResult;
    }
    if (bodyResult instanceof ReturnValue) {
      return bodyResult;
    }

    if (fs.update) {
      const updateResult = evaluate(fs.update, loopEnv);
      if (updateResult instanceof ErrorValue) {
        return updateResult;
      }
    }
  }

  return new NullValue();
}

// Evaluates a while statement.
function evalWhileStatement(
  ws: WhileStatement,
  env: Environment
): RuntimeObject | null {
  while (true) {
    const conditionResult = evaluate(ws.condition, env);

    if (conditionResult instanceof ErrorValue) {
      return conditionResult;
    }

    if (!isTruthy(conditionResult)) {
      break;
    }

    const bodyResult = evaluate(ws.body, env);

    if (bodyResult instanceof ErrorValue) {
      return bodyResult;
    }
    if (bodyResult instanceof ReturnValue) {
      return bodyResult;
    }
  }
  return new NullValue();
}

// Evaluates a do...while statement.
function evalDoWhileStatement(
  dws: DoWhileStatement,
  env: Environment
): RuntimeObject | null {
  while (true) {
    const bodyResult = evaluate(dws.body, env);

    if (bodyResult instanceof ErrorValue) {
      return bodyResult;
    }
    if (bodyResult instanceof ReturnValue) {
      return bodyResult;
    }

    const conditionResult = evaluate(dws.condition, env);

    if (conditionResult instanceof ErrorValue) {
      return conditionResult;
    }

    if (!isTruthy(conditionResult)) {
      break;
    }
  }
  return new NullValue();
}

// Evaluates an identifier.
function evalIdentifier(node: Identifier, env: Environment): RuntimeObject {
  const identifierName = node.value;
  const value = env.get(identifierName);

  if (!value) {
    return new ErrorValue(`identifier not found: ${identifierName}`);
  }

  return value;
}

// Evaluates a prefix expression.
function evalPrefixExpression(
  operator: string,
  right: RuntimeObject | null
): RuntimeObject {
  if (right === null) {
    return new ErrorValue(
      'Operand for prefix expression is unexpectedly null in helper function'
    );
  }

  switch (operator) {
    case '!':
      return isTruthy(right) ? new BooleanValue(false) : new BooleanValue(true);
    case '-':
      if (right instanceof IntegerValue) {
        return new IntegerValue(-right.value);
      }
      if (right instanceof FloatValue) {
        return new FloatValue(-right.value);
      }
      return new ErrorValue(
        `Type Error: Cannot apply operator '-' to type ${right.type()}`
      );
    default:
      return new ErrorValue(
        `Unknown or unhandled prefix operator in helper: ${operator}`
      );
  }
}

function evalInfixExpression(
  operator: string,
  left: RuntimeObject | null,
  right: RuntimeObject | null
): RuntimeObject {
  if (left === null || right === null) {
    return new ErrorValue(
      'Operands for infix expression are unexpectedly null in helper function'
    );
  }

  if (left instanceof IntegerValue && right instanceof IntegerValue) {
    return evalIntegerInfixExpression(operator, left, right);
  }
  if (left instanceof FloatValue && right instanceof FloatValue) {
    return evalFloatInfixExpression(operator, left, right);
  }
  if (left instanceof FloatValue && right instanceof IntegerValue) {
    return evalFloatInfixExpression(
      operator,
      left,
      new FloatValue(right.value)
    );
  }
  if (left instanceof IntegerValue && right instanceof FloatValue) {
    return evalFloatInfixExpression(
      operator,
      new FloatValue(left.value),
      right
    );
  }
  if (operator === '+') {
    if (left instanceof StringValue || right instanceof StringValue) {
      return new StringValue(left.inspect() + right.inspect());
    }
  }
  if (operator === '==') {
    return new BooleanValue(left.inspect() === right.inspect());
  }
  if (operator === '!=') {
    return new BooleanValue(left.inspect() !== right.inspect());
  }

  return new ErrorValue(
    `Type Mismatch: Cannot apply operator '${operator}' between ${left.type()} and ${right.type()}`
  );
}

function evalIntegerInfixExpression(
  operator: string,
  left: IntegerValue,
  right: IntegerValue
): RuntimeObject {
  const leftVal = left.value;
  const rightVal = right.value;

  switch (operator) {
    case '+':
      return new IntegerValue(leftVal + rightVal);
    case '-':
      return new IntegerValue(leftVal - rightVal);
    case '*':
      return new IntegerValue(leftVal * rightVal);
    case '/':
      if (rightVal === 0) {
        return new ErrorValue('Division by zero.');
      }
      return new IntegerValue(Math.trunc(leftVal / rightVal)); // Integer division
    case '%':
      if (rightVal === 0) {
        return new ErrorValue('Modulo by zero.');
      }
      return new IntegerValue(leftVal % rightVal);
    case '<':
      return new BooleanValue(leftVal < rightVal);
    case '>':
      return new BooleanValue(leftVal > rightVal);
    case '==':
      return new BooleanValue(leftVal === rightVal);
    case '!=':
      return new BooleanValue(leftVal !== rightVal);
    case '<=':
      return new BooleanValue(leftVal <= rightVal);
    case '>=':
      return new BooleanValue(leftVal >= rightVal);
    default:
      return new ErrorValue(`Unknown integer infix operator: ${operator}`);
  }
}

// Helper for Float infix operations
function evalFloatInfixExpression(
  operator: string,
  left: FloatValue,
  right: FloatValue
): RuntimeObject {
  const leftVal = left.value;
  const rightVal = right.value;

  switch (operator) {
    case '+':
      return new FloatValue(leftVal + rightVal);
    case '-':
      return new FloatValue(leftVal - rightVal);
    case '*':
      return new FloatValue(leftVal * rightVal);
    case '/':
      if (rightVal === 0.0) {
        return new ErrorValue('Division by zero.');
      }
      return new FloatValue(leftVal / rightVal);
    case '<':
      return new BooleanValue(leftVal < rightVal);
    case '>':
      return new BooleanValue(leftVal > rightVal);
    case '==':
      return new BooleanValue(leftVal === rightVal);
    case '!=':
      return new BooleanValue(leftVal !== rightVal);
    case '<=':
      return new BooleanValue(leftVal <= rightVal);
    case '>=':
      return new BooleanValue(leftVal >= rightVal);
    default:
      return new ErrorValue(`Unknown float infix operator: ${operator}`);
  }
}

// Evaluates expressions.
function evalExpressions(
  exps: Expression[],
  env: Environment
): Array<RuntimeObject | null> {
  const results: Array<RuntimeObject | null> = [];
  for (const exp of exps) {
    const evaluated = evaluate(exp, env);
    results.push(evaluated);
  }
  return results;
}

// applies a function
function applyFunction(
  fnObj: RuntimeObject,
  args: Array<RuntimeObject | null>
): RuntimeObject {
  if (!(fnObj instanceof FunctionValue)) {
    return new ErrorValue(`Cannot apply non-function type: ${fnObj.type()}`);
  }

  const func = fnObj as FunctionValue;
  const funcNameForError = func.fnName || 'anonymous';

  if (func.params.length !== args.length) {
    return new ErrorValue(
      `Expected ${func.params.length} arguments for function '${funcNameForError}' but got ${args.length}`
    );
  }

  // TYPE CHECKING ARGUMENTS
  for (let i = 0; i < func.params.length; i++) {
    const param = func.params[i];
    const expectedTypeStr = param.type.value;
    const argRuntimeValue = args[i];

    if (argRuntimeValue === null) {
      if (
        expectedTypeStr !== 'any' &&
        expectedTypeStr !== 'object' &&
        expectedTypeStr !== 'null'
      ) {
        return new ErrorValue(
          `Type Error: Argument ${i + 1} ('${
            param.value
          }') for function '${funcNameForError}' expected type '${expectedTypeStr}' but received null.`
        );
      }
    } else {
      const actualRuntimeType = argRuntimeValue.type();
      let actualTypeStr: string;

      switch (actualRuntimeType) {
        case ObjectType.INTEGER:
          actualTypeStr = 'int';
          break;
        case ObjectType.FLOAT:
          actualTypeStr = 'float';
          break;
        case ObjectType.BOOLEAN:
          actualTypeStr = 'boolean';
          break;
        case ObjectType.STRING:
          actualTypeStr = 'string';
          break;
        case ObjectType.NULL:
          actualTypeStr = 'null';
          break;
        case ObjectType.FUNCTION:
          actualTypeStr = 'function';
          break;
        case ObjectType.ERROR:
          actualTypeStr = 'error';
          break;
        case ObjectType.RETURN_VALUE:
          actualTypeStr = 'return_value';
          break;
        default:
          const _exhaustiveCheck: never = actualRuntimeType;
          return new ErrorValue(
            `Internal Error: Unhandled object type '${_exhaustiveCheck}' during function call type checking.`
          );
      }

      if (expectedTypeStr !== actualTypeStr) {
        if (expectedTypeStr !== 'any' && expectedTypeStr !== 'object') {
          if (expectedTypeStr === 'float' && actualTypeStr === 'int') {
          } else {
            return new ErrorValue(
              `Type Error: Argument ${i + 1} ('${
                param.value
              }') for function '${funcNameForError}' expected type '${expectedTypeStr}' but got type '${actualTypeStr}'.`
            );
          }
        }
      }
    }
  }

  const functionEnv = new Environment(func.env);

  for (let i = 0; i < func.params.length; i++) {
    const paramName = func.params[i].value;
    let argValueToBind = args[i];

    // If an int is passed to a float parameter, convert it to FloatValue for consistency within the function body if desired.
    // Or, rely on arithmetic operations to handle mixed types if that's the design.
    // For this example, let's do an explicit conversion before binding if types were int -> float.
    const expectedParamTypeStr = func.params[i].type.value;
    if (
      expectedParamTypeStr === 'float' &&
      argValueToBind instanceof IntegerValue
    ) {
      argValueToBind = new FloatValue(argValueToBind.value);
    }

    const finalArgValue =
      argValueToBind === null ? new NullValue() : argValueToBind!;
    const defineResult = functionEnv.define(paramName, finalArgValue, false);
    if (defineResult instanceof ErrorValue) {
      return defineResult;
    }
  }

  const evaluatedBody = evaluate(func.body, functionEnv);
  const unwrappedResult = unwrapReturnValue(evaluatedBody);
  return unwrappedResult === null ? new NullValue() : unwrappedResult;
}

// Unwraps a return value.
function unwrapReturnValue(obj: RuntimeObject | null): RuntimeObject | null {
  if (obj instanceof ReturnValue) {
    return obj.value;
  }
  return obj;
}

// Evaluates a var statement.
function evalVarStatement(
  stmt: VarStatement,
  env: Environment
): RuntimeObject | null {
  const varName = stmt.name.value;
  const initializer = stmt.value;
  let valueToStore: RuntimeObject = new NullValue();

  if (initializer) {
    const evaluatedInitializer = evaluate(initializer, env);
    if (evaluatedInitializer instanceof ErrorValue) {
      return evaluatedInitializer;
    }
    valueToStore =
      evaluatedInitializer === null ? new NullValue() : evaluatedInitializer;
  }

  const defineResult = env.define(varName, valueToStore, false);

  if (defineResult instanceof ErrorValue) {
    return defineResult;
  }

  return new NullValue();
}

// Evaluates a const statement.
function evalConstStatement(
  stmt: ConstStatement,
  env: Environment
): RuntimeObject | null {
  const constName = stmt.name.value;
  const initializer = stmt.value;

  if (!initializer) {
    return new ErrorValue(`Constant '${constName}' must be initialized.`);
  }

  const evaluatedInitializer = evaluate(initializer, env);

  if (evaluatedInitializer instanceof ErrorValue) {
    return evaluatedInitializer;
  }

  const valueToStore =
    evaluatedInitializer === null ? new NullValue() : evaluatedInitializer;

  const defineResult = env.define(constName, valueToStore, true);

  if (defineResult instanceof ErrorValue) {
    return defineResult;
  }

  return new NullValue();
}

function evalExpressionStatementNode(
  node: ExpressionStatement,
  env: Environment
): RuntimeObject | null {
  return evaluate(node.expression, env);
}

function evalReturnStatementNode(
  node: ReturnStatement,
  env: Environment
): RuntimeObject | null {
  const val = evaluate(node.returnValue, env);
  if (val instanceof ErrorValue) {
    return val;
  }
  return new ReturnValue(val === null ? new NullValue() : val);
}

function evalAssignmentExpressionNode(
  node: AssignmentExpression,
  env: Environment
): RuntimeObject | null {
  const targetIdentifier = node.name as Identifier;
  const targetName = targetIdentifier.value;
  const valueToAssign = evaluate(node.value, env);

  if (valueToAssign instanceof ErrorValue) {
    return valueToAssign;
  }

  const actualValueToAssign =
    valueToAssign === null ? new NullValue() : valueToAssign;

  const setResult = env.set(targetName, actualValueToAssign);

  if (setResult instanceof ErrorValue) {
    return setResult;
  }
  return setResult;
}

function evalPrefixExpressionNode(
  node: PrefixExpression,
  env: Environment
): RuntimeObject | null {
  if (node.operator === '++' || node.operator === '--') {
    if (!(node.right instanceof Identifier)) {
      return new ErrorValue(
        `Invalid operand for prefix '${node.operator}': expected an identifier.`
      );
    }
    const identifierNode = node.right as Identifier;
    const varName = identifierNode.value;
    const currentValue = env.get(varName);

    if (currentValue === undefined) {
      return new ErrorValue(`identifier not found: ${varName}`);
    }

    let newValueNumber: number;
    let newRuntimeValue: IntegerValue | FloatValue;

    if (currentValue instanceof IntegerValue) {
      newValueNumber =
        node.operator === '++'
          ? currentValue.value + 1
          : currentValue.value - 1;
      newRuntimeValue = new IntegerValue(newValueNumber);
    } else if (currentValue instanceof FloatValue) {
      newValueNumber =
        node.operator === '++'
          ? currentValue.value + 1
          : currentValue.value - 1;
      newRuntimeValue = new FloatValue(newValueNumber);
    } else {
      return new ErrorValue(
        `Type Error: Cannot apply operator '${
          node.operator
        }' to type ${currentValue.type()}`
      );
    }
    const updateResult = env.set(varName, newRuntimeValue);
    if (updateResult instanceof ErrorValue) {
      return updateResult;
    }
    return newRuntimeValue;
  } else {
    const prefixRightOperand = evaluate(node.right, env);
    if (prefixRightOperand instanceof ErrorValue) {
      return prefixRightOperand;
    }
    if (prefixRightOperand === null) {
      return new ErrorValue(
        'Operand for prefix expression unexpectedly evaluated to null by main evaluate.'
      );
    }
    return evalPrefixExpression(node.operator, prefixRightOperand);
  }
}

function evalInfixExpressionNode(
  node: InfixExpression,
  env: Environment
): RuntimeObject | null {
  const left = evaluate(node.left, env);
  if (left instanceof ErrorValue) {
    return left;
  }
  if (left === null) {
    return new ErrorValue(
      'Left operand of infix expression evaluated to unexpected null.'
    );
  }

  if (node.operator === '&&') {
    if (!isTruthy(left)) {
      return new BooleanValue(false);
    }
    const right = evaluate(node.right, env);
    if (right instanceof ErrorValue) {
      return right;
    }
    if (right === null) {
      return new ErrorValue(
        "Right operand of '&&' evaluated to unexpected null."
      );
    }
    return new BooleanValue(isTruthy(right));
  }

  if (node.operator === '||') {
    if (isTruthy(left)) {
      return new BooleanValue(true);
    }
    const right = evaluate(node.right, env);
    if (right instanceof ErrorValue) {
      return right;
    }
    if (right === null) {
      return new ErrorValue(
        "Right operand of '||' evaluated to unexpected null."
      );
    }
    return new BooleanValue(isTruthy(right));
  }

  const right = evaluate(node.right, env);
  if (right instanceof ErrorValue) {
    return right;
  }
  if (right === null) {
    return new ErrorValue(
      'Right operand of infix expression evaluated to unexpected null.'
    );
  }

  return evalInfixExpression(node.operator, left, right);
}

function evalPostfixExpressionNode(
  node: PostfixExpression,
  env: Environment
): RuntimeObject | ErrorValue {
  if (!(node.left instanceof Identifier)) {
    return new ErrorValue(
      'Invalid left-hand side in postfix operation: expected an identifier.'
    );
  }
  const identifierNode = node.left as Identifier;
  const varName = identifierNode.value;
  const originalValue = env.get(varName);

  if (originalValue === undefined) {
    return new ErrorValue(`identifier not found: ${varName}`);
  }
  if (originalValue instanceof ErrorValue) {
    return originalValue;
  }
  if (originalValue === null) {
    return new ErrorValue(
      `Identifier '${varName}' resolved to unexpected null.`
    );
  }

  let newValueNumber: number;
  let newRuntimeValue: IntegerValue | FloatValue;

  if (originalValue instanceof IntegerValue) {
    newValueNumber =
      node.operator === '++'
        ? originalValue.value + 1
        : originalValue.value - 1;
    newRuntimeValue = new IntegerValue(newValueNumber);
  } else if (originalValue instanceof FloatValue) {
    newValueNumber =
      node.operator === '++'
        ? originalValue.value + 1
        : originalValue.value - 1;
    newRuntimeValue = new FloatValue(newValueNumber);
  } else {
    return new ErrorValue(
      `Type Error: Cannot apply postfix operator '${
        node.operator
      }' to type ${originalValue.type()}`
    );
  }

  const setResult = env.set(varName, newRuntimeValue);
  if (setResult instanceof ErrorValue) {
    return setResult;
  }

  return originalValue;
}

function evalFunctionLiteralNode(
  node: FunctionLiteral,
  env: Environment
): RuntimeObject {
  return new FunctionValue(node.params, node.body, env, undefined);
}

function evalCallExpressionNode(
  node: CallExpression,
  env: Environment
): RuntimeObject | null {
  const funcToCall = evaluate(node.func, env);
  if (funcToCall instanceof ErrorValue) {
    return funcToCall;
  }
  if (funcToCall === null || !(funcToCall instanceof FunctionValue)) {
    const typeStr = funcToCall === null ? 'null' : funcToCall.type();
    return new ErrorValue(`Cannot call non-function type: ${typeStr}`);
  }

  const evaluatedArgs = evalExpressions(node.args, env);
  const firstErrorArg = evaluatedArgs.find((arg) => arg instanceof ErrorValue);
  if (firstErrorArg) {
    return firstErrorArg as ErrorValue;
  }
  return applyFunction(funcToCall, evaluatedArgs);
}

// Evaluates a function declaration statement.
function evalFunctionDeclarationStatementNode(
  node: FunctionDeclaration,
  env: Environment
): RuntimeObject | null {
  const funcName = node.name.value;
  const funcValue = new FunctionValue(node.params, node.body, env, funcName);

  const defineResult = env.define(funcName, funcValue, true);

  if (defineResult instanceof ErrorValue) {
    return defineResult;
  }

  return new NullValue();
}

// Evaluates a display statement.
function evalDisplayStatementNode(
  node: DisplayStatement,
  env: Environment
): RuntimeObject | null {
  const outputs: string[] = [];
  for (const argExp of node.args) {
    const evaluatedArg = evaluate(argExp, env);
    if (evaluatedArg instanceof ErrorValue) {
      return evaluatedArg;
    }
    outputs.push(evaluatedArg === null ? 'null' : evaluatedArg.inspect());
  }
  console.log(outputs.join(' '));
  return new NullValue();
}
