import { Sized, nothing, setNoncallableRef, unit } from "./core";
import { match } from "./match";

export * from "./cmp";
export * from "./core";
export * from "./match";
export * from "./option";
export * from "./result";

class Var implements Sized<string> {
  $ref: [string] = [Var.name];

  variant(value: Function | string): Var {
    return setNoncallableRef(this, value) as Var
  }

  Foo() {
    return this.variant(this.Foo);
  }

  Bar() {
    return this.variant(String())
  }
}