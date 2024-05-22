import { Sized, panic } from "./core";
import { match } from "./match";
import { Err, Ok, Result } from "./result";

export class Option<T> implements Sized<T> {
  $ref: [T] = [Option.name] as [T];
  $option: [string, T] = ["", undefined as T];

  some(value: T): Option<T> {
    return this.#variant(value, this.some);
  }

  none(): Option<T> {
    return this.#variant(undefined as T, this.none);
  }

  #variant(value: T, fn: Function): Option<T> {
    this.$ref[0] = value;
    this.$option = [fn.name, value];
    return this;
  }
 
  unwrap(): T {
    return this.isSome() ? this.$option[1] : panic("None");
  }
  
  expect(message: string): T {
    return this.isSome() ? this.$option[1] : panic(message);
  }
  
  unwrapOr(value: T): T {
    return this.isSome() ? this.$option[1] : value;
  }
  
  isNone(): boolean {
    return match<Option<T>, boolean>(this, () => [
      [None<T>(), () => true]   
    ], () => false);
  }
  
  isSome(): boolean {
    return match<Option<T>, boolean>(this, (v) => [
      [Some(v.$ref[0]), () => true]   
    ], () => false);
  }

  intoResult<E>(error: E): Result<T, E> {
    return this.isSome() ? Ok(this.$option[1] as unknown as T) : Err<E, T>(error);
  }

  static from<T>(value: T): Option<T> {
    return value === null || value === undefined ? None<T>() : Some(value);
  }

  static None<T = unknown>(): Option<T> {
    return new Option<T>().none();
  }

  static Some<T>(value: T): Option<T> {
    return new Option<T>().some(value);
  }

}

export const {Some, None} = Option; 