import { Param } from '../ast/functions';
import { BlockStatement } from '../ast/statements';
import { TypeNode } from '../ast';
import { Environment } from './environment';

// Defines the type of a runtime object.
export enum ObjectType {
  INTEGER = 'INTEGER',
  FLOAT = 'FLOAT',
  BOOLEAN = 'BOOLEAN',
  STRING = 'STRING',
  NULL = 'NULL',
  RETURN_VALUE = 'RETURN_VALUE',
  ERROR = 'ERROR',
  FUNCTION = 'FUNCTION',
}

// Represents a runtime object.
export interface RuntimeObject {
  type(): ObjectType;
  inspect(): string;
}

// Represents an integer value at runtime.
export class IntegerValue implements RuntimeObject {
  constructor(public value: number) {}
  type(): ObjectType {
    return ObjectType.INTEGER;
  }
  inspect(): string {
    return this.value.toString();
  }
}

// Represents a floating-point value at runtime.
export class FloatValue implements RuntimeObject {
  constructor(public value: number) {}
  type(): ObjectType {
    return ObjectType.FLOAT;
  }
  inspect(): string {
    return this.value.toString();
  }
}

// Represents a boolean value at runtime.
export class BooleanValue implements RuntimeObject {
  constructor(public value: boolean) {}
  type(): ObjectType {
    return ObjectType.BOOLEAN;
  }
  inspect(): string {
    return this.value.toString();
  }
}

// Represents a string value at runtime.
export class StringValue implements RuntimeObject {
  constructor(public value: string) {}
  type(): ObjectType {
    return ObjectType.STRING;
  }
  inspect(): string {
    return this.value;
  }
}

// Represents a null value at runtime.
export class NullValue implements RuntimeObject {
  type(): ObjectType {
    return ObjectType.NULL;
  }
  inspect(): string {
    return 'null';
  }
}

// Represents a return value from a function.
export class ReturnValue implements RuntimeObject {
  constructor(public value: RuntimeObject) {}
  type(): ObjectType {
    return ObjectType.RETURN_VALUE;
  }
  inspect(): string {
    return this.value.inspect();
  }
}

// Represents an error that occurred during evaluation.
export class ErrorValue implements RuntimeObject {
  constructor(public message: string) {}
  type(): ObjectType {
    return ObjectType.ERROR;
  }
  inspect(): string {
    return 'ERROR: ' + this.message;
  }
}

export class FunctionValue implements RuntimeObject {
  public fnName?: string;
  public returnType: TypeNode;

  constructor(
    public params: Param[],
    public body: BlockStatement,
    public env: Environment,
    public returnTypeNode: TypeNode,
    fnName?: string
  ) {
    this.fnName = fnName;
    this.returnType = returnTypeNode;
  }

  type(): ObjectType {
    return ObjectType.FUNCTION;
  }

  inspect(): string {
    const paramTypesString = this.params.map((p) => p.type.value).join(', ');
    const returnTypeString = this.returnType.value;
    return `fn(${paramTypesString}) => ${returnTypeString}`;
  }
}
