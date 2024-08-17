export function eqType<T>(lhs: T, rhs: T): boolean {
  if (typeof lhs === "function" && typeof rhs === "function") {
    return true;
  }

  if (
    typeof lhs !== "object" &&
    typeof rhs !== "object" &&
    lhs !== null &&
    rhs !== null
  ) {
    return typeof lhs === typeof rhs;
  }

  if (
    (typeof lhs === "object" && typeof rhs !== "object") ||
    (typeof lhs !== "object" && typeof rhs == "object")
  ) {
    return false;
  }

  if (
    (Array.isArray(lhs) && !Array.isArray(rhs)) ||
    (!Array.isArray(lhs) && Array.isArray(rhs))
  ) {
    return false;
  }

  if (
    (lhs instanceof Map && !(rhs instanceof Map)) ||
    (!(lhs instanceof Map) && rhs instanceof Map) ||
    (lhs instanceof Set && !(rhs instanceof Set)) ||
    (!(lhs instanceof Set) && rhs instanceof Set) ||
    (lhs instanceof Date && !(rhs instanceof Date)) ||
    (!(lhs instanceof Date) && rhs instanceof Date) ||
    (lhs instanceof Promise && !(rhs instanceof Promise)) ||
    (!(lhs instanceof Promise) && rhs instanceof Promise)
  ) {
    return false;
  }

  if (Array.isArray(lhs) && Array.isArray(rhs)) {
    if (lhs.length === 0 && 0 === rhs.length) {
      return true;
    }

    const lhsObjective = lhs.every((lVal) => {
      let undefinedGuard = false;
      const found = rhs.find((rVal) => {
        const eq = eqType(lVal, rVal);
        undefinedGuard = (eq && lVal === undefined) || false;
        return eq;
      });
      return (
        found === "" ||
        found === 0 ||
        found === false ||
        (found === undefined && undefinedGuard) ||
        (found === null && lVal === null) ||
        found
      );
    });

    const rhsObjective = rhs.every((rVal) => {
      let undefinedGuard = false;
      const found = lhs.find((lVal) => {
        const eq = eqType(lVal, rVal);
        undefinedGuard = (eq && lVal === undefined) || false;
        return eq;
      });

      return (
        found === "" ||
        found === 0 ||
        found === false ||
        (found === undefined && undefinedGuard) ||
        (found === null && rVal === null) ||
        found
      );
    });

    return lhsObjective && rhsObjective;
  }

  if (
    (lhs instanceof Map && rhs instanceof Map) ||
    (lhs instanceof Set && rhs instanceof Set)
  ) {
    return eqType(Array.from(lhs), Array.from(rhs));
  }

  if (
    (lhs instanceof Date && rhs instanceof Date) ||
    (lhs instanceof Promise && rhs instanceof Promise)
  ) {
    return true;
  }

  if (lhs instanceof Object && rhs instanceof Object) {
    const lhskeys = Object.keys(lhs);
    const rhskeys = Object.keys(rhs);

    if (lhskeys.length === rhskeys.length) {
      return lhskeys.every(
        (key) => rhskeys.find((val) => val === key) !== undefined,
      )
        ? eqType(Object.values(lhs), Object.values(rhs))
        : false;
    }
  }

  return lhs === null && rhs === null;
}
