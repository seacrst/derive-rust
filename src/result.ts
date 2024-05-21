import { Sized, panic } from "./common";

interface ResultSelf<T, E> {
  ok: (value: T) => T;
  err: (value: E) => E;
};

export class Result<T, E> implements Sized<T | E> {
  readonly $ref: [T | E];
  private ok: T;
  private err: E;
  
  constructor(impl: (self: ResultSelf<T, E>) => T | E) {
    const result = impl({
      err(error: E) {
        return error;
      },
      ok(value: T) {
        return value;
      }
    });

    this.$ref = [result];
    this.ok = result as T || null as T;
    this.err = result as E || null as E;
  }

  expect(message: string): T {
    return this.isOk() ? this.ok : panic(message);
  }

  unwrap(): T {
    if (this.isOk()) {
      return this.ok;
    } else {
      panic(`Err(${this.err})`)
    }
  }

  unwrapOr(value: T): T {
    if (this.isErr()) {
      return value;
    }

    return this.ok;
  }

  unwrapErr(): E {
    if (this.isErr()) {
      return this.err;
    } else {
      panic(`Ok(${this.ok})`);
    }
  }

  isOk() {
    return this.ok !== null;
  }

  isErr() {
    return this.err !== null;
  }

  static Ok<T, E = unknown>(value: T): Result<T, E> {
    return new Result<T, E>(({ok}) => ok(value));
  }

  static Err<E, T = unknown>(value: E): Result<T, E> {
    return new Result<T, E>(({err}) => err(value));
  }
}

export const {Err, Ok} = Result; 