# Rust-like utils for JavaScript

Start using match pattern, enums with generics and other features similarly to the Rust programming language.

## Option\<T>

```ts
const a = Some("hello");
const b: Option<string> = None();
const c = None<string>();

a.match({
  None: () => "",
  Some: (v) => v + " world!"
})

c.match({
  None: () => "",
  Some: (v) => v
})

// Data validation

const opt = Option.from<number>(undefined);

const x2Num = opt.match({
  Some: (num) => num * 2,
  None: () => panic("null or undefined")
});

```

## Result<T, E>

```ts
const fooOk: Result<{result: boolean}, {}> = Ok({result: true});
const fooErr: Result<{result: boolean}, {}> = Err({});

// Data validation

const result = Result.from<{data: Data[]}>(null);

const data = result.match({
  Err: () => panic("null or undefined"),
  Ok: (value) => value.data
});

// Error interception
Result.fromNever(() => { throw "Thrown" }).unwrapErr() // Thrown

Result.fromPromise(Promise.reject("Rejected"))
  .then(r => r.unwrapErr()) // Rejected

Result.fromAsync(async () => await fetch("You should learn Rust"))
  .then(r => r.unwrapErr()) // Response error

```
## Match

```ts
match("hello", [
  (hello) => [hello, () => hello + " world" ], // wrap arm in function for matching with `ref` value
  ["foo", "bar", () =>  /* anything */] // list many things for matching
], _ => "" ) // default expression
```
**matches**
compare values. Returns boolean
```ts
matches(lhs, rhs, optCondition)
```
**eqType** compares types. Returns boolean
```ts

const o1 = {
    a: 1,
    barFn() {}
}

const o2 = {
    a: 1,
    fooFn() {}
}

eqType(o1, o2) // false. Compares all the properties
```

## Box\<T>
It can be useful for guarding values like empty strings or zeros which give you **false** result in comparisons.
Also when you need to store null or undefined deliberately

```ts
[undefined, null, ...].find(value => value === undefined) // ???
// it returns undefined when nothing is found but array includes undefined as actual value

// Another example
function foo(): void { }

function bar(): void {
  return undefined;
}
// They are the same but what if...

function bar(): Box<undefined> {
  return new Box(undefined);
}

// or
// box function also added if you don't like `new` keyword
function bar(): Box<undefined> {
  return box(undefined);
}

const boxed = bar();
boxed.leak() // undefined as value
```

## Structs

```ts
class Foo {
  #x: number;
  a: string;

  constructor(self: Self<Foo>) {
    // Assigns all the Self<S> properties except methods
    // Seals `this` by default with third argument
    // Be cautious. `this` - is the FIRST ARGUMENT
    impl(this, self);
  }

  f() {
    console.log(this.a)
  }
}

new Foo({
  a: "hello" // Self<S> checks only fields
})
```

## Ranges

```ts
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

// If omitted started/ended by empty string, you get tail/head respectively
rangeChars('c', '', "abcd12553") // ['c', 'd', '1', '2', '5', '5', '3']

// However it does work with distinctive characters
// You can see 5 two times so takes first one. If you need advanced approach then use string slice method
rangeChars('', '5', "abcd12553") // ['a', 'b', 'c','d', '1', '2', '5']
```

## Channels

```ts
function syncChannel<T>(): [SyncSender<T>, SyncReceiver<T>];

const [tx,rx] = syncChannel();

tx.send(1) // returns Result<{}, SenderError> to check if valid value has been sent
tx.send(2)
rx.recv() // returns Option<T>. In this case Some(1)


// Async channel
const [tx, rx] = channel<{data: string[]}>();

tx.send(Promise.resolve({data: ["foo"]}));
tx.send(Promise.reject("ERROR"));
tx.send(Promise.resolve({data: ["bar"]}));

const last = 5

range(1, last).forEach(async (current) => {
  const result = await rx.recv();

  result.mapErr((err) => current !== 2 ? "Empty" : err).match({
    Ok:(data) => console.log("ok ==> ", data, current),
    Err:(err) => console.error("err ==> ", err, current)
  })
});

rx.recv().then(result => {
  result.mapErr(() => "Completed").match({
    Ok:(data) => console.log(data),
    Err:(err) => console.error("err ==>", err, last)
  })
}
);

// Output:

// ok ==>  { data: [ 'foo' ] } 1
// err ==>  ERROR 2
// ok ==>  { data: [ 'bar' ] } 3
// err ==>  Empty 4
// err ==> Completed 5

// Be aware `recv` has to be called in async scope
```

## Declarations

```ts
function match<T, A>(value: T, arms: Array<Arm<T, A> | ArmFn<T, A>>, defaultArm: (value: T) => A): A;
function matches<T>(lhs: T, rhs: T, condition?: boolean): boolean;

type Self<S> = { [K in keyof S as S[K] extends Function ? never : K]: S[K] }

class Option<T> {
    #private;
    private constructor();
    static None<T>(): Option<T>;
    static Some<T>(value: T): Option<T>;
    static from<T>(value: T | null | undefined): Option<T>;
    match<A>(option: OptionArms<T, A>): A;
    unwrap(): T;
    unwrapOr(value: T): T;
    unwrapOrElse(f: () => T): T;
    expect(message: string): T;
    inspect(f: (value: T) => any): Option<T>;
    insert(value: T): T;
    getOrInsert(value: T): T;
    getOrInsertWith(f: () => T): T;
    isNone(): boolean;
    isSome(): boolean;
    isSomeAnd(f: (value: T) => boolean): boolean;
    intoResult<E>(error: E): Result<T, E>;
    map<F>(predicate: (value: T) => F): Option<F>;
    mapOr<V>(value: V, f: (value: T) => V): V;
    mapOrElse<V>(defaultF: () => V, f: (value: T) => V): V;
    filter(predicate: (value: T) => boolean): Option<T>;
    flatten(): Option<T>;
    take(): Option<T>;
    takeIf(predicate: (value: T) => boolean): Option<T>;
    replace(value: T): Option<T>;
    zip<U>(other: Option<U>): Option<[T, U]>;
    zipWith<O, R>(other: Option<O>, f: (self: T, other: O) => R): Option<R>;
    unzip<U>(): [Option<T>, Option<U>];
    transpose<E>(): Result<Option<T>, E>;
    okOr<E>(err: E): Result<T, E>;
    okOrElse<E>(err: () => E): Result<T, E>;
    and<U>(option: Option<U>): Option<U>;
    andThen<U>(f: (value: T) => Option<U>): Option<U>;
    or(option: Option<T>): Option<T>;
    orElse(f: () => Option<T>): Option<T>;
    xor(option: Option<T>): Option<T>;
    [Symbol.iterator](): Generator<T | undefined, void, unknown>;
    iter(): (T | undefined)[];
}

class Result<T, E> {
    #private;
    private constructor();
    static Err<E, T>(value: E): Result<T, E>;
    static Ok<T, E>(value: T): Result<T, E>;
    static from<T>(value: T | null | undefined): Result<T, null | undefined>;
    static fromNever<T, E>(fn: () => T): Result<T, E>;
    static fromPromise<T, E>(promise: Promise<T>): Promise<Result<T, E>>;
    static fromAsync<T, E>(fn: () => Promise<T>): Promise<Result<T, E>>;
    match<A>(arms: ResultArms<T, E, A>): A;
    isErr(): boolean;
    isErrAnd(f: (value: E) => boolean): boolean;
    isOk(): boolean;
    isOkAnd(f: (value: T) => boolean): boolean;
    ok(): Option<T>;
    err(): Option<E>;
    unwrap(): T;
    unwrapOr(value: T): T;
    unwrapOrElse(f: (err: E) => T): T;
    unwrapErr(): E;
    expect(message: string): T;
    intoOk(): T;
    intoErr(): E;
    intoOption(): Option<T>;
    map<F>(predicate: (ok: T) => F): Result<F, E>;
    mapOr<V>(value: V, f: (ok: T) => V): V;
    mapOrElse<F, V>(defaultF: (err: E) => V, f: (ok: T) => V): V;
    mapErr<F>(predicate: (err: E) => F): Result<T, F>;
    flatten(): Result<T, E>;
    transpose(): Option<Result<T, E>>;
    inspect(f: (ok: T) => any): Result<T, E>;
    inspectErr(f: (err: E) => any): Result<T, E>;
    and<U>(res: Result<U, E>): Result<U, E>;
    andThen<U>(f: (ok: T) => Result<U, E>): Result<U, E>;
    or<F>(res: Result<T, F>): Result<T, F>;
    orElse<F>(f: (err: E) => Result<T, F>): Result<T, F>;
    [Symbol.iterator](): Generator<T | E, void, unknown>;
    iter(): (T | E)[];
}

class Box<T> implements Sized<T> {
    #private;
    constructor(boxed: T);
    leak(): T;
}

box<T>(boxed: T): Box<T>;
function range(start: number, end: number): number[];
function rangeInc(start: number, end: number): number[];
function rangeChars(start: string, end: string, str: string): string[];
function rangeCharsInc(start: string, end: string, str: string): string[];
function rangeCharsRev(start: string, end: string, str: string): string[];
function rangeCharsRevInc(start: string, end: string, str: string): string[];
function clone<T>(value: T): T; // structuredClone but with methods
function syncChannel<T>(): [SyncSender<T>, SyncReceiver<T>];
function channel<T>(): [Sender<T>, Receiver<T>];
function impl<S>(target: S, self: S, seal: boolean): void;
function eqType<T>(lhs: T, rhs: T): boolean;
function eq<T>(lhs: T, rhs: T): 1 | -1 | 0;
function panic(reason: string): never;
```
