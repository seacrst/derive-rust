export interface Sized<T = null> {
  readonly $ref: [T];
}

export type Nothing = {};
export type Unit = {};

export function unit(): Unit {
  return (function () {
    return "()";
  })() as Unit;
}

export function nothing(): Nothing {
  return (function() {
    return "Nothing";
  })() as Nothing
}

export type Self<S, T = void> = (self: S) => T;

export function ref<T, R>(self: Sized<R>, fn: (r: R) => T): T {
  return fn(self.$ref[0]);
}

export function panic(reason: string): never {
  throw new Error(reason);
}

export function ex<T, V>(fn: (value: V) => T, value?: V): T {
  return fn(value!)
}

export function dex<I, O, V>(input: (value: V) => I, output: (value: ReturnType<typeof input>) => O, value?: V) {
  return output(input(value!));
}

export function getRef<T>(s: Sized<T>): T {
  return ref(s, r => r);
}

export function setNoncallableRef<T>(self: Sized<T>, value: T): Sized<T> {
  self.$ref[0] = typeof value === "function" ? value.name as T : value as T;
  return self;
}