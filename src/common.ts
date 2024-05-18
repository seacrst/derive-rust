export interface Sized<T = null> {
  readonly $ref: [T];
}

export type Nothing = "_";
export type Unit = "()";

export function unit(): Unit {
  return "()";
}

export function nothing(): Nothing {
  return "_";
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