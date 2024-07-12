import { Sized } from "./mod";
import { None, Option, Some } from "./option";

export interface ResultArms<T, E, A> {
  Err(err: E): A;
  Ok(ok: T): A;
}

interface ResultSelf<T, E> {
  value: T | E,
  variant: string
};

export class Result<T, E> implements Sized<T | E> {
  $ref: [T | E];
  self: ResultSelf<T, E>;

  private constructor(variant: Function, value: T | E) {
    this.self = {variant: variant.name, value};
    this.$ref = [value];
    Object.freeze(this);
    Object.freeze(this.self);
    Object.freeze(this.$ref);
  }

  static Err<E, T>(value: E): Result<T, E> {
    return new Result<T, E>(Err, value);
  }

  static Ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(Ok, value);
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
    switch (this.self.variant) {
      case arms.Ok.name: {
        return arms.Ok(this.self.value as T)
      };

      default: {
        return arms.Err(this.self.value as E);
      };
    }
  }

  isErr(): boolean {
    return this.self.variant === Err.name;
  }

  isOk(): boolean {
    return this.self.variant === Ok.name;
  }

  ok(): Option<T> {
    return this.isOk() ? Some(this.self.value as T) : None();
  }

  err(): Option<E> {
    return this.isErr() ? Some(this.self.value as E) : None();
  }

  unwrap(): T {
    if (this.isErr()) {
      throw new Error(Err.name);
    }

    return this.self.value as T;
  }

  unwrapOr(value: T): T {
    return this.isErr() ? (this.self.value as T) : value;
  }

  unwrapErr(): E {
    if (this.isOk()) {
      throw new Error(Ok.name);
    }

    return this.self.value as E;
  }

  expect(message: string): T {
    if (this.isErr()) {
      throw new Error(message);
    }

    return this.self.value as T;
  }

  intoOption(): Option<T> {
    return this.isOk() ? Some(this.self.value as T) : None();
  }

  map<F>(predicate: (ok: T) => F): Result<F, E> {
    if (this.isOk()) {
      return Ok(predicate(this.self.value as T));
    }

    return this as unknown as Result<F, E>;
  }

  mapErr<F>(predicate: (err: E) => F): Result<T, F> {
    if (this.isErr()) {
      return Err(predicate(this.self.value as E));
    }

    return this as unknown as Result<T, F>;
  }

  flatten(): Result<T, E> {
    return this.match({
      Ok:(res) => res instanceof Result ? res.isOk() ? res.unwrap() : res.unwrapErr() : this,
      Err:(res) => res instanceof Result ? res.isErr() ? res.unwrapErr() : res.unwrap() : this
    });
  }

  ifLet<F>(
    fn: (r: T | E) => Result<T, E>, 
    ifExpr: (value: T | E) => F, 
    elseExpr?: (value: T | E) => F
  ): F {
    const result = fn(this.self.value);
    return this.self.variant === result.self.variant ? 
    ifExpr(result.self.value) : 
    elseExpr?.(result.self.value) as F;
  }
}

export const Err = Result.Err;
export const Ok = Result.Ok;