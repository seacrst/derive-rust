export interface Sized<T = null> {
  readonly $ref: [T];
}

export type Self<S, T = void> = (self: S) => T;

export function implStruct<S>(target: S, self: S) {
  for (const key in self) {
    target[key] = self[key];
  }
}

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

export function setRef<T>(self: Sized<T>, value: T): Sized<T> {
  self.$ref[0] = value;
  return self;
}

export function isValue(value: any): boolean {
    return !(value === null || value === undefined);
}

export function clone<T>(value: T): T {
  
  if (value !== null && typeof value !== "object") {
    return value;
  }
  
  if (typeof value !== "function" && !Array.isArray(value)) {
    return {
      ...Object.fromEntries(Object.entries(value!)
        .filter(([_, val]) => typeof val !== "function")
        .map(([key, val]) => [key, clone(val)])),
      ...Object.fromEntries(Object.entries(value!)
        .filter(([_, val]) => typeof val === "function"))
    } as T
  }

  if (Array.isArray(value)) {
    return value.map(v => clone(v)) as T
  }

  return value;
}


export class Box<T> {
  constructor(private boxed: T) {
    Object.freeze(this);
  }

  leak(): T {
    return this.boxed;
  }
}

export function box<T>(boxed: T): Box<T> {
  return new Box(boxed);
}