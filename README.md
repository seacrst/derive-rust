# Rust-like utils for JavaScript

Start using match pattern, enums with generics and other features similarly to the Rust programming language.

## Option\<T>

```ts
const a: Option<string> = Some("hello");
const b: Option<string> = None(); 
const c = None<string>();

// for exhaustive matching use match method
a.match({
  None: () => "",
  Some: (v) => v + " world!"
})

c.match({
  None: () => "",
  Some: (v) => v
})

```

## Result<T, E>

```ts
const fooOk: Result<{result: boolean}, {}> = Ok({result: true});
const fooErr: Result<{result: boolean}, {}> = Err({});
```
## Match
You can use **match** function with primitive and object data. Primitive and Objects implemented by **Sized\<T>** can be used for "refutable" pattern

```ts
const s1 = match(Some("bar"), (opt) => [ // opt -> Some("bar")
  [Some("baz"), () => "some"],
  [None<string>(), () => "none"]
], (_, s) => s); // _ -> Some("bar"), s -> "bar"

console.log(s1) // "bar"

const s2 = match(Some("bar"), (v) => [
  [Some("baz"), Some("bar"), () => "baz or bar"], // arm with more than one value
  [None<string>(), () => "none"]
], (_, s) => s);

console.log(s2) // "baz or bar"

const s3 = match(Some("bar"), (v) => [
  (bar) => [Some("baz"), Some(bar), () => "baz or " + bar], // patterns are used by wrapping in functions
  [None<string>(), () => "none"]
], (_, s) => s);

console.log(s3) // "baz or bar"


const val = match(9, () => [
  [3, () => Some(3)],
  [0, () => None()],
  (v) => [v, () => Some(v + 1)] // pattern sample with primitives 
], () => None())

console.log(val.unwrap()) // 10
```

## Don't compare functions

```ts
    cmp(() => {}, () => {}) // 0. Zero means ignoring truthy/falsy case
// So

const o1 = {
    a: 1,
    barFn() {}
}

const o2 = {
    a: 1,
    fooFn() {}
}

cmp(o1, o2) // 1 - means true
eq(o1, o2) // true. eq() it's just wrapper to cmp(o1, o2) === 1


// But their types are different 

partialEq(o1, o2) // false. As it's generic wrapper to eqType()
```

## Enums
```ts

interface MyEnumArms<T, A> {
  Foo(value: T): A,
  Bar(value: string): A,
  Baz(value: string): A,
}

class MyEnum<T = string> implements Sized<T> {
  static Foo = (value: string) => new MyEnum(self => self.variant.Foo, value);
  static Bar = () => new MyEnum(self => self.variant.Bar);
  static Baz = () => new MyEnum(self => self.variant.Baz);

  $ref: [T]; // it is need to use pattern in match function
  self: {
    variant: string,
    value: T
  }; // must be public for cmp() function 

  variant = {
    Foo: (value: string) => value,
    Bar: () => {},
    Baz: () => {},
  }

  private constructor(impl: (self: MyEnum<T>) => Function, value?: T) {
    let variant = impl(this);

    this.self = {
      variant: variant.name, 
      value: variant(value) ?? variant.name as T
    };

    this.$ref = [this.self.value];
    Object.freeze(this);
    Object.freeze(this.self);
    Object.freeze(this.$ref);
  }

  match<A>(arms: MyEnumArms<T, A>): A {
    switch (this.self.variant) {
      case arms.Foo.name: return arms.Foo(this.self.value);
      case arms.Bar.name: return arms.Bar(arms.Bar.name);
      default: return arms.Baz(arms.Baz.name);
    }
  }
}

const fooMatch = MyEnum.Foo("foo").match({
  Foo: (foo) => `my ${foo} value`,
  Bar: (bar) => `my ${bar} value`,
  Baz: (baz) => `my ${baz} value`,
});

console.log({fooMatch}) // { fooMatch: 'my foo value' }

const bazMatch = MyEnum.Baz().match({
  Foo: (foo) => `my ${foo} value`,
  Bar: (bar) => `my ${bar} value`,
  Baz: (baz) => `my ${baz + baz.slice(-1)} value`,
});


console.log({bazMatch}) // { bazMatch: 'my Bazz value' }

match(MyEnum.Foo("hello"), () => [
  (hello) => [MyEnum.Foo(hello), () => console.log(hello + " world")],
  (bar) => [MyEnum.Bar(), () => console.log("hello " + bar)]
], (_, hello) => console.log(hello))

// hello world
// ________________

match(MyEnum.Bar(), () => [
  (hello) => [MyEnum.Foo(hello), () => console.log(hello + " world")],
  (bar) => [MyEnum.Bar(), () => console.log("hello " + bar.toLowerCase())]
], (_, hello) => console.log(hello))

// hello bar
// ________________

match(MyEnum.Baz(), () => [
  (hello) => [MyEnum.Foo(hello), () => console.log(hello + " world")],
  (bar) => [MyEnum.Bar(), () => console.log("hello " + bar.toLowerCase())]
], (_, Baz) => console.log(Baz.toLowerCase()))

// baz
// ________________
```
## Other features

```ts
type Self<S, T = void> = (self: S) => T;

// Create instances similarly to Rust
constructor(impl: (self: Class) => TypeYouWant) { impl(this) }
// or 
constructor(self: Self<Class, TypeYouWant>) { self(this) } // the same


// Ranges

// 1..10
range(1, 10) // [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]

// 1..=10
rangeInc(1, 10) // [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]

// 'v'..='x'
rangeCharsInc('v', 'x', "stuvwxyz") // [ 'v', 'w', 'x' ]

// It works in the opposite way
range(5, -5) // [ 5, 4, 3, 2, 1, 0, -1, -2, -3, -4 ]
rangeInc(5, -5) // [ 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5 ]

// For reveresed result with strings you need to use rangeCharsRev() and rangeCharsRevInc() though
rangeCharsRev('b', 'f', "abcdefghI") // [ 'f', 'e', 'd', 'c' ]


// Channels
function syncChannel<T>(): [SyncSender<T>, SyncReceiver<T>];

const [tx,rx] = syncChannel();

tx.send(1) // returns Result<{}, SenderError> to check if valid value has been sent
tx.send(2)
rx.recv() // returns Option<T>. In this case Some(1)

// Async channel
function channel<T>(): [Sender<T>, Receiver<T>];

const [tx, rx] = channel() // Saves the order of Promises resolving them through Result
tx.send(async () => {}) // void
rx.recv() // Promise<Result<T, ReceiverError<E>>>
```

## Declarations

```ts
export interface OptionArms<T, A> {
    Some(value: T): A;
    None(): A;
}
interface OptionSelf<T> {
    variant: string;
    value: T;
}
export declare class Option<T> implements Sized<T> {
    $ref: [T];
    self: OptionSelf<T>;
    private constructor();
    static None<T>(): Option<T>;
    static Some<T>(value: T): Option<T>;
    static from<T>(value: T): Option<T>; // Get Some if provided value not null or undefined otherwise None
    match<A>(arms: OptionArms<T, A>): A;
    unwrap(): T; // Panics if None
    unwrapOr(value: T): T;
    expect(message: string): T; // Panics if None
    isNone(): boolean;
    isSome(): boolean;
    intoResult<E>(error: E): Result<T, E>;
    map<F>(fn: (value: T) => F): Option<F>;
    okOr<E>(err: E): Result<T, E>;
    okOrElse<E>(fn: () => E): Result<T, E>;
    ifLet<F>(fn: (opt: T) => Option<T>, ifExpr: (value: T) => F, elseExpr?: (value: T) => F): F;
}


export interface ResultArms<T, E, A> {
    Err(err: E): A;
    Ok(ok: T): A;
}
interface ResultSelf<T, E> {
    value: T | E;
    variant: string;
}
export declare class Result<T, E> implements Sized<T | E> {
    $ref: [T | E];
    self: ResultSelf<T, E>;
    private constructor();
    static Err<E, T>(value: E): Result<T, E>;
    static Ok<T, E>(value: T): Result<T, E>;
    static from<T, E>(value: T | E): Result<T, E>; // Get Ok if provided value not null or undefined otherwise Err
    match<A>(arms: ResultArms<T, E, A>): A;
    isErr(): boolean;
    isOk(): boolean;
    ok(): Option<T>;
    err(): Option<E>;
    unwrap(): T; // Panics if Err
    unwrapOr(value: T): T;
    unwrapErr(): E; // Panics if Ok
    expect(message: string): T; // Panics if Err
    intoOption(): Option<T>;
    map<F>(fn: (ok: T) => F): Result<F, E>;
    mapErr<F>(fn: (err: E) => F): Result<T, F>;
    ifLet<F>(fn: (r: T | E) => Result<T, E>, ifExpr: (value: T | E) => F, elseExpr?: (value: T | E) => F): F;
}


match<V, T>(value: V, matchArms: (value: V) => Array<MatchArm<V, T> | MatchArmFn<V, T>>, defaultMatchArm: (value: V, p: Extract<V>) => T): T;

ifLet<V>(p: (p: Extract<V>) => V, value: V, ifExpr: (v: Extract<V>) => void, elseExpr?: (v: Extract<V>) => void): void;

interface Sized<T = null> {
    readonly $ref: [T];
}

type Self<S, T = void> = (self: S) => T;

function eqType(lhs: any, rhs: any): boolean;
function cmp<T>(lhs: T, rhs: T): 1 | -1 | 0;
function orderKeys(keys: string[], targetKeys: string[]): string[];
function partialEq<T>(lhs: T, rhs: T): boolean;
function eq<T>(lhs: T, rhs: T): boolean;
function ref<T, R>(self: Sized<R>, fn: (r: R) => T): T;
function panic(reason: string): never;
function ex<T, V>(fn: (value: V) => T, value?: V): T; // expression; the same as (() => {})()
function dex<I, O, V>(input: (value: V) => I, output: (value: ReturnType<typeof input>) => O, value?: V): O; // double expression
function getRef<T>(s: Sized<T>): T;
function setNoncallableRef<T>(self: Sized<T>, value: T): Sized<T>;
function setRef<T>(self: Sized<T>, value: T): Sized<T>;
function range(start: number, end: number): number[];
function rangeInc(start: number, end: number): number[];
function rangeChars(start: string, end: string, str: string): string[];
function rangeCharsInc(start: string, end: string, str: string): string[];
function rangeCharsRev(start: string, end: string, str: string): string[];
function rangeCharsRevInc(start: string, end: string, str: string): string[];
function clone<T>(value: T): T; // structuredClone but with methods
function syncChannel<T>(): [SyncSender<T>, SyncReceiver<T>]; 
function channel<T>(): [Sender<T>, Receiver<T>];
```
