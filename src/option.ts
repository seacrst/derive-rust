import { Sized, panic } from "./core";

type OptionSelf<T> = {
  some: (value: T) => T, 
  none: () => undefined
};

export class Option<T> implements Sized<T> {
  $ref: [T];
  some: T;
  none = undefined;
  
  constructor(impl: (self: OptionSelf<T>) => T | undefined) {
    const option = impl({
      some(value: T): T {
        return value;
      },
      none(): undefined {
        return undefined;
      }
    });
    
    this.$ref = [option] as [T];
    this.some = option as T || null as T;
    this.none = option as undefined;
  }
  
  unwrap(): T {
    return this.isSome() ? this.some : panic("None");
  }
  
  expect(message: string): T {
    return this.isSome() ? this.some : panic(message);
  }
  
  unwrapOr(value: T): T {
    return this.isSome() ?
    this.some : value;
  }
  
  isNone() {
    return this.some === null;
  }
  
  isSome() {
    return !this.isNone();
  }

  static None<T = unknown>(): Option<T> {
    return new Option<T>(({none}) => none());
  }

  static Some<T = unknown>(value: T): Option<T> {
    return new Option<T>(({some}) => some(value));
  }

}

export const {Some, None} = Option; 