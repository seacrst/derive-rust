import { Err, Ok, Result } from "./result";
import { panic } from "./panking";

enum OptionVariant {
  Some,
  None
}

export interface OptionArms<T, A> {
  Some(value: T): A;
  None(): A;
}

export class Option<T> {
  #value: T;
  private variant: OptionVariant;

  private constructor(variant: OptionVariant, value: T) {
    this.variant = variant;
    this.#value = value;
  }

  static None<T>(): Option<T> {
    return new Option(OptionVariant.None, undefined as T);
  }

  static Some<T>(value: T): Option<T> {
    return new Option(OptionVariant.Some, value);
  }

  static from<T>(value: T | null | undefined): Option<T> {
    return value === null || value === undefined ? None() : Some(value);
  }

  match<A>(option: OptionArms<T, A>): A {
    return this.isSome() ? option.Some(this.#value) : option.None();
  }
 
  unwrap(): T {
    return this.isSome() ? this.#value : panic("None");
  }

  unwrapOr(value: T): T {
    return this.isSome() ? this.#value : value;
  }

  unwrapOrElse(f: () => T): T {
    return this.isSome() ? this.#value : f();
  }
  
  expect(message: string): T {
    return this.isSome() ? this.#value : panic(message);
  }

  inspect(f: (value: T) => any): Option<T> {
    if (this.isSome()) {
      f(this.#value);
    }

    return this;
  }

  insert(value: T): T {
    this.#value = value;

    if (this.isNone()) {
      this.variant = OptionVariant.Some;
    }

    return value;
  }

  getOrInsert(value: T): T {
    if (this.isNone()) {
      this.#value = value;
      this.variant = OptionVariant.Some;
    }

    return value;
  }

  getOrInsertWith(f: () => T): T {
    if (this.isNone()) {
      this.#value = f();
      this.variant = OptionVariant.Some;
    }

    return f();
  }
  
  isNone(): boolean {
    return this.variant === OptionVariant.None;
  }
  
  isSome(): boolean {
    return this.variant === OptionVariant.Some;
  }

  isSomeAnd(f: (value: T) => boolean): boolean {
    return this.isSome() && f(this.#value);
  }

  intoResult<E>(error: E): Result<T, E> {
    return this.isSome() ? Ok(this.#value) : Err<E, T>(error);
  }

  map<F>(predicate: (value: T) => F): Option<F> {
    if (this.isSome()) {
      return Some(predicate(this.#value));
    }

    return this as unknown as Option<F>;
  }

  mapOr<V>(value: V, f: (value: T) => V): V {
    if (this.isNone()) {
      return value;
    }

    return f(this.#value);
  }

  mapOrElse<V>(defaultF: () => V, f: (value: T) => V): V {
    return this.isSome() ? f(this.#value) : defaultF();
  }

  filter(predicate: (value: T) => boolean): Option<T> {
    if (this.isSome()) {
      return predicate(this.unwrap()) ? this : None()
    }

    return None();
  }

  flatten(): Option<T> {
    return this.match({
      Some:(v) => v instanceof Option && v.isSome() ? v.unwrap() : None(),
      None:() => this
    });
  }

  take(): Option<T> {
    if (this.isSome()) {
      const opt = Some(this.#value);
      this.variant = OptionVariant.None;
      this.#value = undefined as T;

      return opt;
    }

    return None();
  }

  takeIf(predicate: (value: T) => boolean): Option<T> {
    if (this.isSome() && predicate(this.#value)) {
      const opt = Some(this.#value);
      this.variant = OptionVariant.None;
      this.#value = undefined as T;

      return opt;
    }

    return this;
  }

  replace(value: T): Option<T> {
    if (this.isSome()) {
      this.#value = value;
      return Some(value);
    }
    this.variant = OptionVariant.Some;
    this.#value = value;
    return None();
  }

  zip<U>(other: Option<U>): Option<[T, U]> {
    if (other.isNone() ) {
      return None<[T, U]>();
    }

    return Some([this.#value, other.unwrap()]);
  }

  zipWith<O, R>(other: Option<O>, f: (self: T, other: O) => R): Option<R> {
    if (this.isSome() && other.isSome()) {
      return Some(f(this.#value, other.unwrap()));
    }

    return None();
  }

  unzip<U>(): [Option<T>, Option<U>] {
    if (this.isSome() && Array.isArray(this.#value) && this.#value.length > 0) {
      return this.#value.length === 2 ? [Some(this.#value[0]), Some(this.#value[1])] : [Some(this.#value[0]), None()];
    }

    return [this, None()];
  }

  transpose<E>(): Result<Option<T>, E> {
    if (this.isSome() && this.#value instanceof Result) {
      return this.#value.isOk() ? Ok(Some(this.#value.unwrap())) : Err(undefined as E);
    }

    return Ok(None());
  }

  okOr<E>(err: E): Result<T, E> {
    return this.isSome() ? Ok(this.#value) : Err(err);
  }

  okOrElse<E>(err: () => E): Result<T, E> {
    return this.isSome() ? Ok(this.#value) : Err(err());
  }

  and<U>(option: Option<U>): Option<U> {
    return this.isSome() && option.isSome() ? option : this as unknown as Option<U>;
  }

  andThen<U>(f: (value: T) => Option<U> ): Option<U> {
    return this.isNone() ? this as unknown as Option<U> : f(this.#value);
  }

  or(option: Option<T>): Option<T> {
    if (this.isSome()) {
      return this;
    }
    
    if (option.isSome()) {
      return option;
    }

    return this; 
  }

  orElse(f: () => Option<T>): Option<T> {
    if (this.isSome()) {
      return this;
    }

    const option = f();

    if (option.isSome()) {
      return option;
    }

    return this;
  }

  xor(option: Option<T>): Option<T> {
    if (option.isSome() && this.isSome() || this.isNone() && option.isNone()) {
      return None<T>();
    }

    return this.isSome() ? this : option;
  }

  *[Symbol.iterator]() {
    if (this.isSome()) {
      yield this.#value;
    } else {
      yield undefined;
    }
    return;
  }

  iter() {
    return Array.from(this);
  }
}

export const None = Option.None; 
export const Some = Option.Some; 