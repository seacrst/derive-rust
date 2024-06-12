# derive-rust

Rust-like utils for JavaScript. Start using match pattern, enums with generics and other features similarly to the Rust programming language.

## Option\<T>

```ts
const a: Option<string> = Some("hello");
const b: Option<string> = None(); 
const c = None<string>();
```

## Result<T, E>

```ts
const fooOk: Result<{result: boolean}, {}> = Ok({result: true});
const fooErr: Result<{result: boolean}, {}> = Err({});
```
## Match
You can use **match** function with primitive and object data. Primitive and Objects implemented by **Sized\<T>** can be used for "refutable" pattern

```ts
const s1 = match(Some("bar"), (v) => [ // v = Some("bar")
  [Some("baz"), () => "baz"],
  [None<string>(), () => "none"]
], (v, s) => ""); // v = Some("bar"), s = "bar"

console.log(s1) // ""

const s2 = match(Some("bar"), (v) => [
  [Some("baz"), Some("bar"), () => "baz or bar"], // arm with more than one value
  [None<string>(), () => "none"]
], (_, s) => s);

console.log(s2) // "baz or bar"

const s3 = match(Some("bar"), (v) => [
  (bar) => [Some("baz"), Some(bar), () => "baz or " + bar], // pattern is used by wrapping in functions
  [None<string>(), () => "none"]
], (_, s) => s);

console.log(s3) // "baz or bar"


const val = match(9, () => [
  [3, () => Some(3)],
  [0, () => None()],
  v => [v, () => Some(v + 1)] // pattern sample with primitives 
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
eq(o1, o2) // true. It's just wrapper to cmp(o1, o2) === 1


// But their types are different 

partialEq(o1, o2) // false. As it's generic wrapper to eqType()
```

## My approach of creating enums with generics 
```ts

class MyEnum<T = string> implements Sized<T> {
  $ref: [T] = [MyEnum.name] as [T];
  variant: [string | T] = [""]; // must be public for cmp() function

  #variant(value: T | Function | string): MyEnum<T> {
    setNoncallableRef(this, value) as MyEnum<T> // or this.$ref[0] = value;
    this.variant = [fn.name]; // this value additionally guarantees that the object is unique
    Object.freeze(this);

    return this; 
  }

  Foo() {
    return this.variant(this.Foo);
  }

  Bar() {
    return this.variant("baz");
  }
}

const result = match(new MyEnum().Bar(), () => [
  (v) => [new MyEnum().Foo(), () => v],
  (v) => [new MyEnum().Bar(), () => v]
], () => "");

console.log(result) // "Bar"
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
class Option<T> implements Sized<T> {
    #private;
    $ref: [T];
    $option: [string, T];
    some(value: T): Option<T>;
    none(): Option<T>;
    unwrap(): T;
    expect(message: string): T;
    unwrapOr(value: T): T;
    isNone(): boolean;
    isSome(): boolean;
    intoResult<E>(error: E): Result<T, E>;
    static from<T>(value: T): Option<T>;
    static None<T = unknown>(): Option<T>;
    static Some<T>(value: T): Option<T>;
}

class Result<T, E> implements Sized<T | E> {
    #private;
    $ref: [T | E];
    $result: [string, T | E];
    ok(value: T): Result<T, E>;
    err(value: E): Result<T, E>;
    isOk(): boolean;
    isErr(): boolean;
    expect(message: string): T;
    unwrap(): T;
    unwrapOr(value: T): T;
    unwrapErr(): E;
    intoOption(): Option<T>;
    static from<T, E>(value: T | E): Result<T, E>;
    static Ok<T, E>(value: T): Result<T, E>;
    static Err<E, T>(value: E): Result<T, E>;
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
function ex<T, V>(fn: (value: V) => T, value?: V): T; // any expression just like (function(value) {})(value) . Parameter not required
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
function clone<T>(value: T): T;
function syncChannel<T>(): [SyncSender<T>, SyncReceiver<T>];
function channel<T>(): [Sender<T>, Receiver<T>];
```
