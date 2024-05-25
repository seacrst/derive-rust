import { cmp } from "./cmp";
import { Sized, ex } from "./core";

export type Extract<V> = V extends Sized<infer T> ? T : V;
export type MatchArm<V, T> = [...V[], () => T];
export type MatchArmFn<V, T> = (p: Extract<V>) => MatchArm<V, T>;

export function match<V, T>(value: V, matchArms: (value: V) => Array<MatchArm<V, T> | MatchArmFn<V, T>> , defaultMatchArm: (value: V, p: Extract<V>) => T): T {
  const param = value instanceof Object && Object.hasOwn(value, "$ref") ? (value as unknown as Sized<V>).$ref[0] : value;

  if (typeof value === "function") {
    return defaultMatchArm(value, param as Extract<V>);
  }
  
  const arms = matchArms(value)
    .map(arm => typeof arm === "function" ? ex(() => {
        const a = arm(param as Extract<V>);

        if (a.length === 2) {
            return [a];
        }

        const expr = a.pop() as () => T;

        return a.map(v => [v, expr]) as [...V[], () => T]
    }) : ex(() => {

      if (arm.length === 2) {
        return [arm];
      }

      const expr = arm.pop() as () => T;

      return arm.map(v => [v, expr]);
    })
  )
  .flat() as Array<[V, () => T]>

  const found = arms.find(([matchArm]) => matchExpr(value, matchArm, (result) => result === 1))

  if (Array.isArray(found)) {
    return found[1]();
  }

  return defaultMatchArm(value, param as Extract<V>);
}

export function ifLet<V>(p: (p: Extract<V>) => V, value: V, ifExpr: (v: Extract<V>) => void, elseExpr: (v: Extract<V>) => void = () => {}) {
  const param = value instanceof Object && Object.hasOwn(value, "$ref") ? (value as unknown as Sized<V>).$ref[0] : value;
  const lhs = p(param as Extract<V>);

  matchExpr(value, lhs, (result) => result === 1) ? ifExpr(param as Extract<V>) : elseExpr(param as Extract<V>);
}

export function matchExpr<T, R>(lhsValue: T, rhsValue: T, exec: (result: 1 | 0 | -1, lhs: T, rhs: T) => R): R {
  const result = cmp(lhsValue, rhsValue);
  return exec(result, lhsValue, rhsValue);
}