# Rust-like utils for JavaScript

Start using match pattern, enums with generics and other features similarly to the Rust programming language.

## Option\<T>

```ts
const a: Option<string> = Some("hello");
const b: Option<string> = None(); 
const c = None<string>();

// match() method for exhausted matching
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
    cmp(() => {}, () => {}) // 0. Zero means ignoring truthy/falsy case.
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

partialEq(o1, o2) // false. As it's generic wrapper to eqType(o1, o2)
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
  return new Box(undefined); // Implements Sized<T> so you can use it in match with refutable pattern
}

// or 
// box function also added if you don't like new keyword
function bar(): Box<undefined> {
  return box(undefined); 
}

const boxed = bar();
boxed.leak() // undefined as value
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
      value: variant(value) ?? variant.name as T // use Box<T> if you need to store null or undefined 
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
  Baz: (baz) => `my ${baz} value`,
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

Some(10).ifLet((n) => Some(n), (n) => {
  console.log(n / 2)
})

// as Some is a function itself we can pass its ref

Some(10).ifLet(Some, (num) => {
  console.log(num / 2);
}, () => {
  console.log("None 10"); // you can call optional else expression
})

```

## Structs

```ts
interface FooStruct {
  a: string,
  b: number
}

class Foo implements FooStruct {
  a: string;
  b: number;

  constructor(struct: FooStruct) {
    implStruct(this, struct); // Call it when you have too many fields have to be assigned. 
    // Be cautious. this - is the FIRST ARGUMENT
  }
}

const foo = new Foo({
  a: "",
  b: 10
});

// Or

type Self<S, T = void> = (self: S) => T;

class Foo {
  bar: string;

  constructor(impl: (self: Foo) => TypeYouWantOrVoid) { 
    impl(this);
  }
  // or 
  constructor(self: Self<Foo>) { 
    self(this);
  } // the same
}

const foo = new Foo(self => {
  self.bar = "hello";
});
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
```

## Declarations

```ts
interface OptionArms<T, A> {
    Some(value: T): A;
    None(): A;
}

interface OptionSelf<T> {
    variant: string;
    value: T;
}

class Option<T> implements Sized<T> {
    $ref: [T];
    self: OptionSelf<T>;
    private constructor();
    static None<T>(): Option<T>;
    static Some<T>(value: T): Option<T>;
    static from<T>(value: T | null | undefined): Option<T>; // Get Some if provided value not null or undefined otherwise None
    match<A>(arms: OptionArms<T, A>): A;
    unwrap(): T; // Panics if None
    unwrapOr(value: T): T;
    expect(message: string): T; // Panics if None
    isNone(): boolean;
    isSome(): boolean;
    intoResult<E>(error: E): Result<T, E>;
    map<F>(predicate: (value: T) => F): Option<F>;
    filter(predicate: (value: T) => boolean): Option<T>;
    flatten(): Option<T>;
    okOr<E>(err: E): Result<T, E>;
    okOrElse<E>(fn: () => E): Result<T, E>;
    ifLet<F>(fn: (opt: T) => Option<T>, ifExpr: (value: T) => F, elseExpr?: (value: T) => F): F;
}


interface ResultArms<T, E, A> {
    Err(err: E): A;
    Ok(ok: T): A;
}

interface ResultSelf<T, E> {
    value: T | E;
    variant: string;
}

class Result<T, E> implements Sized<T | E> {
    $ref: [T | E];
    self: ResultSelf<T, E>;
    private constructor();
    static Err<E, T>(value: E): Result<T, E>;
    static Ok<T, E>(value: T): Result<T, E>;
    static from<T>(value: T | null | undefined): Result<T, null | undefined>;
    static fromNever<T, E>(fn: () => T): Result<T, E>;
    static fromPromise<T, E>(promise: Promise<T>): Promise<Result<T, E>>;
    static fromAsync<T, E>(fn: () => Promise<T>): Promise<Result<T, E>>;
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
    map<F>(predicate: (ok: T) => F): Result<F, E>;
    mapErr<F>(predicate: (err: E) => F): Result<T, F>;
    flatten(): Result<T, E>;
    ifLet<F>(fn: (r: T | E) => Result<T, E>, ifExpr: (value: T | E) => F, elseExpr?: (value: T | E) => F): F;
}


function match<V, T>(value: V, matchArms: (value: V) => Array<MatchArm<V, T> | MatchArmFn<V, T>>, defaultMatchArm: (value: V, p: Extract<V>) => T): T;

interface Sized<T = null> {
    readonly $ref: [T];
}

type Self<S, T = void> = (self: S) => T;

class Box<T> implements Sized<T> {
    #private;
    readonly $ref: [T];
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
function implStruct<S>(target: S, self: S): void;
function eqType(lhs: any, rhs: any): boolean;
function cmp<T>(lhs: T, rhs: T): 1 | -1 | 0;
function partialEq<T>(lhs: T, rhs: T): boolean;
function eq<T>(lhs: T, rhs: T): boolean;
function panic(reason: string): never;
// expression; the same as (() => {})() 
function ex<T, V>(fn: (value: V) => T, value?: V): T;

// double expression
function dex<I, O, V>(input: (value: V) => I, output: (value: ReturnType<typeof input>) => O, value?: V): O;
function ref<T, R>(self: Sized<R>, fn: (r: R) => T): T;
function getRef<T>(s: Sized<T>): T;
function setNoncallableRef<T>(self: Sized<T>, value: T): Sized<T>;
function setRef<T>(self: Sized<T>, value: T): Sized<T>;
```
