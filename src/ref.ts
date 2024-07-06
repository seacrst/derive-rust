import { Sized } from "./mod";

export function ref<T, R>(self: Sized<R>, fn: (r: R) => T): T {
  return fn(self.$ref[0]);
}

export function getRef<T>(s: Sized<T>): T {
  return ref(s, r => r);
}

export function setRef<T>(self: Sized<T>, value: T): Sized<T> {
  self.$ref[0] = value;
  return self;
}

export function isValue(value: any): boolean {
  return !(value === null || value === undefined);
}