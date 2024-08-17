import { panic } from "./mod";
import { None, Option, Some } from "./option";

enum ResultVariant {
  Ok,
  Err
}

export interface ResultArms<T, E, A> {
  Err(err: E): A;
  Ok(ok: T): A;
}

export class Result<T, E> {
  #value: T | E;
  private variant: ResultVariant;

  private constructor(variant: ResultVariant, value: T | E) {
    this.variant = variant;
    this.#value = value;
  }

  static Err<E, T>(value: E): Result<T, E> {
    return new Result<T, E>(ResultVariant.Err, value);
  }

  static Ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(ResultVariant.Ok, value);
  }

  static from<T>(value: T | null | undefined): Result<T, null | undefined> {
    return value === null || value === undefined
      ? Result.Err<null | undefined, T>(value as null | undefined)
      : Result.Ok<T, null | undefined>(value as T);
  }

  static fromNever<T, E>(fn: () => T): Result<T, E> {
    try {
      return Ok(fn());
    } catch (err) {
      return Err(err as E);
    }
  }

  static fromPromise<T, E>(promise: Promise<T>): Promise<Result<T, E>> {
    return promise
      .then(ok => Ok<T, E>(ok))
      .catch(err => Err<E, T>(err as E));
  }

  static async fromAsync<T, E>(fn: () => Promise<T>): Promise<Result<T, E>> {
    try {
      const ok = await fn();
      return Ok(ok);
    } catch (err) {
      return Err(err as E);
    }
  }

  match<A>(arms: ResultArms<T, E, A>): A {
    return this.isOk() ? arms.Ok(this.#value as T) : arms.Err(this.#value as E);
  }

  isErr(): boolean {
    return this.variant === ResultVariant.Err;
  }

  isErrAnd(f: (value: E) => boolean): boolean {
    return this.isErr() && f(this.#value as E);
  }

  isOk(): boolean {
    return this.variant === ResultVariant.Ok;
  }

  isOkAnd(f: (value: T) => boolean): boolean {
    return this.isOk() && f(this.#value as T);
  }

  ok(): Option<T> {
    return this.isOk() ? Some(this.#value as T) : None();
  }

  err(): Option<E> {
    return this.isErr() ? Some(this.#value as E) : None();
  }

  unwrap(): T {
    if (this.isErr()) {
      panic("Err")
    }

    return this.#value as T;
  }

  unwrapOr(value: T): T {
    return this.isErr() ? this.#value as T : value;
  }

  unwrapOrElse(f: (err: E) => T): T {
    return this.match({
      Ok: (value) => value,
      Err: (error) =>  f(error)
    });
  }

  unwrapErr(): E {
    if (this.isOk()) {
      panic("Ok")
    }

    return this.#value as E;
  }

  expect(message: string): T {
    if (this.isErr()) {
      panic(message)
    }

    return this.#value as T;
  }

  intoOk(): T {
    return this.#value as T;
  }


  intoErr(): E {
    return this.#value as E;
  }

  intoOption(): Option<T> {
    return this.isOk() ? Some(this.#value as T) : None();
  }

  map<F>(predicate: (ok: T) => F): Result<F, E> {
    if (this.isOk()) {
      return Ok(predicate(this.#value as T));
    }

    return this as unknown as Result<F, E>;
  }

  mapOr<V>(value: V, f: (ok: T) => V): V {
    return this.isOk() ? f(this.#value as T): value;
  }

  mapOrElse<F, V>(defaultF: (err: E) => V, f: (ok: T) => V): V {
    return this.isOk() ? f(this.#value as T) : defaultF(this.#value as E);
  } 

  mapErr<F>(predicate: (err: E) => F): Result<T, F> {
    if (this.isErr()) {
      return Err(predicate(this.#value as E));
    }

    return this as unknown as Result<T, F>;
  }

  flatten(): Result<T, E> {
    return this.match({
      Ok:(res) => res instanceof Result ? res.isOk() ? res.unwrap() : res.unwrapErr() : this,
      Err:(res) => res instanceof Result ? res.isErr() ? res.unwrapErr() : res.unwrap() : this
    });
  }

  transpose(): Option<Result<T, E>> {
    if (this.isOk() && this.#value instanceof Option) {
      return this.#value.isNone() ? None() : Some(Ok(this.#value.unwrap()));
    } else {
      return this.isErr() && this.#value instanceof Option && this.#value.isSome() ? Some(Err(this.#value.unwrap())) : None();
    }
  }

  inspect(f: (ok: T) => any): Result<T, E> {
    if (this.isOk()) {
      f(this.#value as T);
    }
    return this;
  }

  inspectErr(f: (err: E) => any): Result<T, E> {
    if (this.isErr()) {
      f(this.#value as E);
    }
    return this;
  }

  and<U>(res: Result<U, E>): Result<U, E> {
    switch (true) {
      case this.isOk() && res.isOk(): return res;
      case this.isErr() && res.isErr(): return this as unknown as Result<U, E>;
      case this.isOk() && res.isErr(): return res;
      case this.isErr() && res.isOk(): return this as unknown as Result<U, E>;
      default: return this as unknown as Result<U, E>
    }
  }

  andThen<U>(f: (ok: T) => Result<U, E>): Result<U, E> {
    return this.isOk() ? f(this.#value as T) : this as unknown as Result<U, E>;
  }

  or<F>(res: Result<T, F>): Result<T, F> {
    return this.isOk() ? this as unknown as Result<T, F> : res;
  }

  orElse<F>(f: (err: E) => Result<T, F> ): Result<T, F> {
    return this.isOk() ? this as unknown as Result<T, F> : f(this.#value as E);
  }

  *[Symbol.iterator]() {
    yield this.#value;
    return;
  }

  iter() {
    return Array.from(this);
  }
}

export const Err = Result.Err;
export const Ok = Result.Ok;