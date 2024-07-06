import { Sized } from "./mod";

export class Box<T> implements Sized<T> {
  readonly $ref: [T];
  #boxed: T;
  constructor(boxed: T) {
    this.$ref = [boxed];
    this.#boxed = boxed;
    Object.freeze(this.$ref);
    Object.freeze(this);
  }

  leak(): T {
    return this.#boxed;
  }
}

export function box<T>(boxed: T): Box<T> {
  return new Box(boxed);
}