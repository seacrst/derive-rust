type Ref<T, R = T> = (value: T) => R;
type Arm<T, A> = [...T[], () => A];
type ArmFn<T, A> = (ref: T) => Arm<T, A>;

export function match<T, A>(value: T, arms: Array<Arm<T, A> | ArmFn<T, A>> , defaultArm: (value: T) => A): A {
  for (const [i, arm] of arms.entries()) {
    if (typeof arm === "function") {
      arms[i] = arm(value);
    }

    if (Array.isArray(arms[i]) && arms[i].length > 0 && typeof arms[i].at(-1) === "function") {
      const expr = arms[i].pop() as () => A;
      const m = arms[i].find(rhs => matches(value, rhs));
      
      if (m === undefined && value === undefined) {
        return expr();
      }

      return m ? expr() : defaultArm(value);
    } else {
      return defaultArm(value);
    }
  }
  return defaultArm(value);
}

export function matches<T>(lhs: T, rhs: T, condition: boolean = true): boolean{

  if (typeof lhs === "function" && typeof rhs === "function" || (lhs instanceof Date && rhs instanceof Date) || (lhs instanceof Promise && rhs instanceof Promise)) {
      return lhs === rhs && condition;
  }
  
  if (typeof lhs !== "object" && typeof rhs !== "object" && lhs !== null && rhs !== null) {
      return lhs === rhs && condition;
  }

  if ((typeof lhs === "object" && typeof rhs !== "object") || (typeof lhs !== "object" && typeof rhs === "object")) {
      return false;
  }

  if ((Array.isArray(lhs) && !Array.isArray(rhs)) || (!Array.isArray(lhs) && Array.isArray(rhs))) {
      return false;
  }

  if (Array.isArray(lhs) && Array.isArray(rhs)) {

      if (lhs.length === 0 && 0 === rhs.length) {
          return true && condition;
      }

      if (lhs.length !== rhs.length) {
          return false;
      }
      
      const lhsObjective = lhs.every(lVal => {
              let undefinedGuard = false;
              const found = rhs.find(rVal => {
                  const is_eq = matches(lVal, rVal, condition);
                  undefinedGuard = is_eq && lVal === undefined;
                  return is_eq; 
              });

              return found === "" || found === 0 || found === false || (found === undefined && undefinedGuard) || (found === null && lVal === null) || found
          });
      
     
      const rhsObjective = rhs.every(rVal => {
              let undefinedGuard = false;
              const found = lhs.find(lVal => {
                  const is_eq = matches(lVal, rVal, condition);
                  undefinedGuard = is_eq && lVal === undefined;
                  return is_eq; 
              });

              return found === "" || found === 0 || found === false || (found === undefined && undefinedGuard) || (found === null && rVal === null) || found;
          });

      return  lhsObjective && rhsObjective && condition;
  }

  if ((lhs instanceof Map && rhs instanceof Map) || (lhs instanceof Set && rhs instanceof Set)) {
      return matches(Array.from(lhs), Array.from(rhs), condition);
  }

  if (lhs instanceof Object && rhs instanceof Object) {
      const lEnt = Object.entries(lhs).filter(([_, v]) => typeof v !== "function");
      const rEnt = Object.entries(rhs).filter(([_, v]) => typeof v !== "function");

      const lhskeys = lEnt.map(([k]) => k);
      const rhskeys = rEnt.map(([k]) => k);
      
      const lhsvals = lEnt.map(([_, v]) => v);
      const rhsvals = rEnt.map(([_, v]) => v);

      if (lhskeys.length === rhskeys.length) {
          return lhskeys.every(key => rhskeys.find(val => val === key) !== undefined) && matches(lhsvals, rhsvals, condition)
      }

      return lhs === null && rhs === null && condition;
  }

  console.error("match error");
  return false;
}