import { Sized, panic } from "./core";
import { match } from "./match";
import { None, Option, Some } from "./option";

export class Result<T, E> implements Sized<T | E> {
  $ref: [T | E] = [Result.name] as [T | E];
  $result: [string, T | E] = ["", undefined as T | E];

  #variant(value: T | E, fn: Function): Result<T, E> {
    this.$ref[0] = value;
    this.$result = [fn.name, value];
    return this;
  }

  ok(value: T): Result<T, E> {
    return this.#variant(value, this.ok);
  }
  
  err(value: E): Result<T, E> {
    return this.#variant(value, this.err);
  }

  isOk(): boolean {
    return match<Result<T, E>, boolean>(this, (v) => [
      [Ok<T, E>(v.$ref[0] as T), () => true]   
    ], () => false);
  }

  isErr(): boolean {
    return match<Result<T, E>, boolean>(this, (v) => [
      [Err<E, T>(v.$ref[0] as E), () => true]
    ], () => false);
  }

  expect(message: string): T {
    return this.isOk() ? this.$result[1] as T : panic(message);
  }

  unwrap(): T {
    return this.isOk() ? this.$result[1] as T : panic(`Err(${JSON.stringify(this.err)})`);
  }

  unwrapOr(value: T): T {
    if (this.isErr()) {
      return value;
    }

    return this.$result[1] as T;
  }

  unwrapErr(): E {
    if (this.isErr()) {
      return this.$result[1] as E;
    } else {
      panic(`Ok(${JSON.stringify(this.ok)})`);
    }
  }

  intoOption(): Option<T> {
    return this.isOk() ? Some(this.ok as T) : None<T>();
  }

  static from<T, E>(value: T | E): Result<T, E> {
    return value === null || value === undefined ? Err<E, T>(undefined as E) : Ok<T, E>(value as T);
  }

  static Ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>().ok(value);
  }

  static Err<E, T>(value: E): Result<T, E> {
    return new Result<T, E>().err(value);
  }
}

export const {Ok, Err} = Result;