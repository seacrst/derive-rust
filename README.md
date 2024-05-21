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

## My vision of enum definition with generic 
```ts

class MyEnum<T = string> implements Sized<T> {
  $ref: [T] = [MyEnum.name] as [T];

  variant(value: T | Function | string): MyEnum<T> {
    return setNoncallableRef(this, value) as MyEnum<T>
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


```ts
class Option<T> implements Sized<T> {
    $ref: [T];
    some: T;
    none: undefined;
    constructor(impl: (self: OptionSelf<T>) => T | undefined);
    unwrap(): T;
    expect(message: string): T;
    unwrapOr(value: T): T;
    isNone(): boolean;
    isSome(): boolean;
    static None<T = unknown>(): Option<T>;
    static Some<T = unknown>(value: T): Option<T>;
}

class Result<T, E> implements Sized<T | E> {
    readonly $ref: [T | E];
    private ok;
    private err;
    constructor(impl: (self: ResultSelf<T, E>) => T | E);
    expect(message: string): T;
    unwrap(): T;
    unwrapOr(value: T): T;
    unwrapErr(): E;
    isOk(): boolean;
    isErr(): boolean;
    intoOption(): Option<T>;
    static Ok<T, E = unknown>(value: T): Result<T, E>;
    static Err<E, T = unknown>(value: E): Result<T, E>;
}

match<V, T>(value: V, matchArms: (value: V) => Array<MatchArm<V, T> | MatchArmFn<V, T>>, defaultMatchArm: (value: V, p: Extract<V>) => T): T;

ifLet<V>(p: (p: Extract<V>) => V, value: V, ifExpr: (v: Extract<V>) => void, elseExpr?: (v: Extract<V>) => void): void;

type Self<S, T = void> = (self: S) => T;

ref<T, R>(self: Sized<R>, fn: (r: R) => T): T;
panic(reason: string): never;
ex<T, V>(fn: (value: V) => T, value?: V): T;
dex<I, O, V>(input: (value: V) => I, output: (value: ReturnType<typeof input>) => O, value?: V): O;
getRef<T>(s: Sized<T>): T;
setNoncallableRef<T>(self: Sized<T>, value: T): Sized<T>;
setRef<T>(self: Sized<T>, value: T): Sized<T>;
range(start: number, end: number): number[];
rangeInc(start: number, end: number): number[];
rangeChars(start: string, end: string, str: string): string;
rangeCharsInc(start: string, end: string, str: string): string;
rangeCharsRev<T>(start: string, end: string, str: string): string;
rangeCharsRevInc<T>(start: string, end: string, str: string): string;
```