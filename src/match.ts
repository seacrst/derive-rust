import { cmp } from "./cmp";
import { panic, ref } from "./common";
import { None, Some } from "./option";

export function match<V, T>(value: V, matchArms: (value: V) => Array<[V | (() => V[]), () => T]>, defaultMatchArm: (value: V) => T): T {
  if (typeof value === "function") {
    return defaultMatchArm(value);
  }

  const found = matchArms(value)
    .map(([matchArm, expr]) => typeof matchArm === "function" && matchArm.name === String() ? [(matchArm as () => V[])(), expr] : [matchArm, expr])
    .map(m => m.flat())
    .find(([matchArm]) => matchExpr(value, matchArm, (result) => result === 1)) as [V, () => T]

  if (Array.isArray(found)) {
    return found[1]();
  }

  return defaultMatchArm(value);
}

export function branch<V, B, T>(value: V, expr: (value: V) => [...B[], () => T], defaultExpr: (value: V) => T): T {
  const match = expr(value);
  const result = match.filter((rhsValue, i, arr) => i !== arr.length - 1 && matchExpr(value, rhsValue as B | V , (result) => result === 1));
  return result.length > 0 ? (match.at(-1) as () => T)() : defaultExpr(value);
}

export function matchExpr<T, R>(lhsValue: T, rhsValue: T, exec: (result: 1 | 0 | -1, lhs: T, rhs: T) => R): R {
  const result = cmp(lhsValue, rhsValue);
  return exec(result, lhsValue, rhsValue);
}