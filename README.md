# derive-rust

javascript utilities inspired by the Rust programming language and its standard library

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
You can use **match** function with primitive and objects data. Objects implemented by **Sized\<T>** can be used for "refutable" pattern

```ts
const s1 = match(Some("bar"), (v) => [ // v = Some("bar")
  [Some("baz"), () => "baz"],
  [None<string>(), () => "none"]
], (v, s) => ""); // v = Some("bar"), s = "bar"

console.log(s1) // ""

const s2 = match(Some("bar"), (v) => [
  [Some("baz"), Some("bar"), () => "baz or bar"], // match more than one value
  [None<string>(), () => "none"]
], (_, s) => s);

console.log(s2) // "baz or bar"

const s3 = match(Some("bar"), (v) => [
  (bar) => [Some("baz"), Some(bar), () => "baz or " + bar], // pattern is used by wrapping in functions
  [None<string>(), () => "none"]
], (_, s) => s);

console.log(s3) // "baz or bar"
```

## You don't need to compare functions

```ts
    cmp(() => {}, () => {}) // 0. Zero means ignoring truthy/falsy case

// So

const o1 = {
    a: 1,
    fn() {}
}

const o2 = {
    a: 1,
    fn() {}
}

cmp(o1, o2) // 1 - means true
eq(o1, o2) // true. It's just wrapper to cmp(o1, o2) === 1


// But their types are different

partialEq(o1, o2) // false. As it's generic wrapper to eqType()
```

## My vision of enum definition with generic 
```ts

class MyEnum<T = string> implements Sized<T> {
  $ref: [T] = [MyEnum.name] as [T];
  variant: [string, T] = ["", undefined as T]; // must be public for cmp() function

  #variant(value: T | Function | string): MyEnum<T> {
    setNoncallableRef(this, value) as MyEnum<T> // or this.$ref[0] = value;
    this.$variant = [fn.name, value]; // if you don't want to store null or undefined which value might be then pass [fn.name, value ?? fn.name]  
    Object.freeze(this);

    return this; 
  }

  Foo() {
    return this.variant(this.Foo);
  }

  Bar() {
    return this.variant("baz")
  }
}

const en = match(new MyEnum().Bar(), () => [
  (e) => [new MyEnum().Foo(), () => e],
  (e) => [new MyEnum().Bar(), () => e]
], () => "");
```

## Declarations of mentioned utils and other haven't ones

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
// You can define 
constructor(impl: (self: Class) => any type you want) { impl(this) }
// or 
constructor(self: Self<Class>) { self(this) } // the same

type Nothing = {};
type Unit = {};

function eqType(lhs: any, rhs: any): boolean;
function cmp<T>(lhs: T, rhs: T): 1 | -1 | 0;
function orderKeys(keys: string[], targetKeys: string[]): string[];
function partialEq<T>(lhs: T, rhs: T): boolean;
function eq<T>(lhs: T, rhs: T): boolean;
function unit(): Unit;
function nothing(): Nothing;
function ref<T, R>(self: Sized<R>, fn: (r: R) => T): T;
function panic(reason: string): never;
function ex<T, V>(fn: (value: V) => T, value?: V): T; // any expression just like (function(value) {})(value). Parameter not required
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

const [tx,rx] = syncChannel();

tx.send(1) // returns Result<{}, SenderError> to check if valid value has been sent
tx.send(2)
rx.recv() // returns Option<T>. In this case Some(1)

function channel<T>(): [Sender<T>, Receiver<T>]; // async channel. send(async() => {}) returns void. recv() returns  Promise<Result<T, ReceiverError<E>>>
```
