import {
  RuntimeObject,
  NullValue,
  BooleanValue,
  IntegerValue,
  FloatValue,
  StringValue,
  FunctionValue,
  ErrorValue,
  ReturnValue,
} from './objects';

export function isTruthy(obj: RuntimeObject | null): boolean {
  if (obj === null) {
    return false;
  }

  if (obj instanceof NullValue) {
    return false;
  }

  if (obj instanceof BooleanValue) {
    return obj.value;
  }

  if (obj instanceof IntegerValue) {
    return obj.value !== 0;
  }

  if (obj instanceof FloatValue) {
    return obj.value !== 0.0;
  }

  if (obj instanceof StringValue) {
    return obj.value !== '';
  }

  if (obj instanceof FunctionValue) {
    return true;
  }

  if (obj instanceof ErrorValue || obj instanceof ReturnValue) {
    return false;
  }

  return true;
}
