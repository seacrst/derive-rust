import { Sized } from "./mod";
import { Err, Ok, Result } from "./result";
import { panic } from "./panking";

export interface OptionArms<T, A> {
  Some(value: T): A;
  None(): A;
}

interface OptionSelf<T> {
  variant: string; 
  value: T;
}

export class Option<T> implements Sized<T> {
  $ref: [T];
  self: OptionSelf<T>;

  private constructor(variant: Function, value: T) {
    this.self = {variant: variant.name, value};
    this.$ref = [value];
    Object.freeze(this);
    Object.freeze(this.self);
    Object.freeze(this.$ref);
  }

  static None<T>(): Option<T> {
    return new Option(None, undefined as T);
  }

  static Some<T>(value: T): Option<T> {
    return new Option(Some, value);
  }

  static from<T>(value: T | null | undefined): Option<T> {
    return value === null || value === undefined ? None() : Some(value);
  }

  match<A>(arms: OptionArms<T, A>): A {
    switch (this.self.variant) {
      case arms.Some.name: return arms.Some(this.self.value);
      default: return arms.None()
    }
  }
 
  unwrap(): T {
    return this.isSome() ? this.self.value : panic("None");
  }

  unwrapOr(value: T): T {
    return this.isSome() ? this.self.value : value;
  }
  
  expect(message: string): T {
    return this.isSome() ? this.self.value : panic(message);
  }
  
  isNone(): boolean {
    return this.self.variant === None.name;
  }
  
  isSome(): boolean {
    return this.self.variant === Some.name;
  }

  intoResult<E>(error: E): Result<T, E> {
    return this.isSome() ? Ok(this.self.value) : Err<E, T>(error);
  }

  map<F>(predicate: (value: T) => F): Option<F> {
    if (this.isSome()) {
      return Some(predicate(this.self.value));
    }

    return this as unknown as Option<F>;
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

  okOr<E>(err: E): Result<T, E> {
    return this.isSome() ? Ok(this.self.value) : Err(err);
  }

  okOrElse<E>(fn: () => E): Result<T, E> {
    return this.isSome() ? Ok(this.self.value) : Err(fn());
  }

  ifLet<F>(
    fn: (opt: T) => Option<T>, 
    ifExpr: (value: T) => F, 
    elseExpr?: (value: T) => F
  ): F {
    const option = fn(this.self.value);
    return this.self.variant === option.self.variant ? 
    ifExpr(option.self.value) : 
    elseExpr?.(option.self.value) as F;
  }
}

export const None = Option.None; 
export const Some = Option.Some; 