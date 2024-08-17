
export class Box<T> {
  #boxed: T;
  
  constructor(boxed: T) {
    this.#boxed = boxed;
    Object.freeze(this);
  }

  leak(): T {
    return this.#boxed;
  }
}

export function box<T>(boxed: T): Box<T> {
  return new Box(boxed);
}