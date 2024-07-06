export function cmp<T>(lhs: T, rhs: T): 1 | -1 | 0 {

    if (typeof lhs === "function" && typeof rhs === "function") {
        return 0;
    }
    
    if (typeof lhs !== "object" && typeof rhs !== "object" && lhs !== null && rhs !== null) {
        return lhs === rhs ? 1 : -1;
    }

    if ((typeof lhs === "object" && typeof rhs !== "object") || (typeof lhs !== "object" && typeof rhs == "object")) {
        return 0;
    }

    if ((Array.isArray(lhs) && !Array.isArray(rhs)) || (!Array.isArray(lhs) && Array.isArray(rhs))) {
        return 0;
    }

    if (
        (lhs instanceof Map && !(rhs instanceof Map)) || (!(lhs instanceof Map) && rhs instanceof Map) || 
        (lhs instanceof Set && !(rhs instanceof Set)) || (!(lhs instanceof Set) && rhs instanceof Set) ||
        (lhs instanceof Date && !(rhs instanceof Date)) || (!(lhs instanceof Date) && rhs instanceof Date) ||
        (lhs instanceof Promise && !(rhs instanceof Promise)) || (!(lhs instanceof Promise) && rhs instanceof Promise)
    ) {
        return 0;
    }

    if (Array.isArray(lhs) && Array.isArray(rhs)) {

        if (lhs.length === 0 && 0 === rhs.length) {
            return 1;
        }

        if (lhs.length !== rhs.length) {
            return -1;
        }
        
        const lhsObjective = lhs.every(lVal => {
                let undefinedGuard = false;
                const found = rhs.find(rVal => {
                    const eq = cmp(lVal, rVal) === 1;
                    undefinedGuard = eq && lVal === undefined || false;
                    return eq; 
                });

                return found === "" || found === 0 || found === false || (found === undefined && undefinedGuard) || (found === null && lVal === null) ? 1 : found
            });
        
       
        const rhsObjective = rhs.every(rVal => {
                let undefinedGuard = false;
                const found = lhs.find(lVal => {
                    const eq = cmp(lVal, rVal) === 1;
                    undefinedGuard = eq && lVal === undefined || false;
                    return eq; 
                });

                return found === "" || found === 0 || found === false || (found === undefined && undefinedGuard) || (found === null && rVal === null) || found;
            });

        return  lhsObjective && rhsObjective ? 1 : -1;
    }

    if ((lhs instanceof Map && rhs instanceof Map) || (lhs instanceof Set && rhs instanceof Set)) {
        return cmp(Array.from(lhs), Array.from(rhs));
    }

    if ((lhs instanceof Date && rhs instanceof Date) || (lhs instanceof Promise && rhs instanceof Promise)) {
        return 1;
    }

    if (lhs instanceof Object && rhs instanceof Object) {

        const lEnt = Object.entries(lhs).filter(([_, v]) => typeof v !== "function");
        const rEnt = Object.entries(rhs).filter(([_, v]) => typeof v !== "function");

        const lhskeys = lEnt.map(([k]) => k);
        const rhskeys = rEnt.map(([k]) => k);
        
        const lhsvals = lEnt.map(([_, v]) => v);
        const rhsvals = rEnt.map(([_, v]) => v);

        if (lhskeys.length === rhskeys.length) {
            return lhskeys.every(key => rhskeys.find(val => val === key) !== undefined) ? cmp(lhsvals, rhsvals) : -1
        }
    }

    return lhs === null && rhs === null ? 1 : -1;
}

export function eq<T>(lhs: T, rhs: T): boolean {
    return cmp(lhs, rhs) === 1;
}