export function cmp<T>(lhsValue: T, rhsValue: T): 1 | 0 | -1 {

  if (typeof lhsValue === "function" && typeof rhsValue === "function") {
    return 0;
  }
  
  if (typeof lhsValue === "object" && typeof rhsValue === "object") {
        
      const lArr = Array.isArray(lhsValue);
      const rArr = Array.isArray(rhsValue);
    
      if ((!lArr && rArr) || (lArr && !rArr)) {
        return 0;
      } else {

        if (lArr && rArr) {

          if (lhsValue.length === 0 && rhsValue.length === 0) {
            return 1;
          }

          if (lhsValue.length === rhsValue.length) {

              const matchedTimes = lhsValue.reduce((tot, cur, i) => tot + cmp(cur, rhsValue[i]), 0);
              
              return matchedTimes === rhsValue.length && matchedTimes === lhsValue.length ? 1 : -1;
          } else { return -1 }
        } else if (!(lhsValue instanceof Map) && !(lhsValue instanceof Set) && !(lhsValue instanceof Date)) {

            if (lhsValue === null && rhsValue === null) {
              return 1;
            }

            if ((lhsValue === null && rhsValue !== null) || (lhsValue !== null && rhsValue === null)) {
              return -1;
            }

            const lhsEnt = Object.entries(lhsValue!).filter(([k, v]) => typeof k !== "function" || typeof v !== "function");
            const rhsEnt = Object.entries(rhsValue!).filter(([k, v]) => typeof k !== "function" || typeof v !== "function");

            if (lhsEnt.length === rhsEnt.length) {
              const r = lhsEnt.reduce((tot, [k, v], i) => tot + (rhsEnt[i][0] === k && cmp(v, rhsEnt[i][1]) === 1 ? 1 : -1), 0);

              return r === lhsEnt.length && r === rhsEnt.length ? 1 : -1

            } else {
              return -1
            }

        } else {
  
            if (lhsValue instanceof Map && rhsValue instanceof Map || lhsValue instanceof Set && rhsValue instanceof Map ) {
              return cmp(Array.from(lhsValue.entries()), Array.from(rhsValue.entries()));
            }

            if (lhsValue instanceof Date && rhsValue instanceof Date) {
              return cmp(lhsValue.getDate(), rhsValue.getDate());
            }

            return 0
        }
      }
  } else {
    return typeof lhsValue === typeof rhsValue ? lhsValue === rhsValue ? 1 : -1 : 0 ;
  }
}