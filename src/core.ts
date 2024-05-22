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

export function setRef<T>(self: Sized<T>, value: T): Sized<T> {
  self.$ref[0] = value;
  return self;
}

export function range(start: number, end: number): number[] {
  const r: number[] = [];
  
  if (start < end) {
    for (let i = start; i < end; i += 1) {
      r.push(i);
    }
    return r;
  } else {
    for (let i = start; i > end; i -= 1) {
      r.push(i);
    }

    return r;
  }
}

export function rangeInc(start: number, end: number): number[] {
  return range(start, start < end ? end + 1 : end - 1);
}

export function rangeChars(start: string, end: string, str: string): string {
  return start.length > 0 && end.length > 0 ? str.slice(str.indexOf(start), str.indexOf(end)) : start;
}

export function rangeCharsInc(start: string, end: string, str: string): string {
  return rangeChars(start, str.at(str.indexOf(end) + 1) || end, str);
}

export function rangeCharsRev(start: string, end: string, str: string): string {
  return Array.from(rangeChars(str.at(str.indexOf(start) + 1) || start, str.at(str.indexOf(end) + 1) || end, str)).reverse().join("")
}

export function rangeCharsRevInc(start: string, end: string, str: string): string {
  return Array.from(rangeChars(start, str.at(str.indexOf(end) + 1) || end, str)).reverse().join("")
}