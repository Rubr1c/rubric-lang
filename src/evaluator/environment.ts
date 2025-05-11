import { ErrorValue, RuntimeObject } from './objects';

// Define the structure for entries in the environment store
interface EnvironmentEntry {
  value: RuntimeObject;
  isConstant: boolean;
}

// Manages the environment for variable storage and scope.
export class Environment {
  // Store now holds EnvironmentEntry objects
  private store: Map<string, EnvironmentEntry> = new Map();
  private outer: Environment | null = null;

  // Creates a new environment, optionally with an outer environment for lexical scoping.
  constructor(outer?: Environment) {
    if (outer) {
      this.outer = outer;
    }
  }

  // Retrieves a variable's RuntimeObject value from the environment or its outer scopes.
  get(name: string): RuntimeObject | undefined {
    const entry = this.store.get(name);
    if (entry) {
      return entry.value;
    }
    if (this.outer) {
      return this.outer.get(name);
    }
    return undefined;
  }

  // Defines a new variable or constant in the current environment.
  define(
    name: string,
    value: RuntimeObject,
    isConstant: boolean
  ): RuntimeObject | ErrorValue {
    if (this.store.has(name)) {
      return new ErrorValue(
        `Identifier '${name}' has already been declared in this scope.`
      );
    }
    this.store.set(name, { value, isConstant });
    return value;
  }

  set(name: string, value: RuntimeObject): RuntimeObject | ErrorValue {
    let env: Environment | null = this;
    while (env !== null) {
      const entry = env.store.get(name);
      if (entry) {
        if (entry.isConstant) {
          return new ErrorValue(`Assignment to constant variable '${name}'.`);
        }
        env.store.set(name, { ...entry, value });
        return value;
      }
      env = env.outer;
    }
    return new ErrorValue(`Identifier '${name}' not found for assignment.`);
  }
}
