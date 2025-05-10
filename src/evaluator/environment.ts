import { RuntimeObject } from './objects';

// Manages the environment for variable storage and scope.
export class Environment {
  private store: Map<string, RuntimeObject> = new Map();
  private outer: Environment | null = null;

  // Creates a new environment, optionally with an outer environment for lexical scoping.
  constructor(outer?: Environment) {
    if (outer) {
      this.outer = outer;
    }
  }

  // Retrieves a variable from the environment or its outer scopes.
  get(name: string): RuntimeObject | undefined {
    let value = this.store.get(name);
    if (!value && this.outer) {
      value = this.outer.get(name);
    }
    return value;
  }

  // Stores a variable in the current environment.
  set(name: string, value: RuntimeObject): RuntimeObject {
    this.store.set(name, value);
    return value;
  }
}
