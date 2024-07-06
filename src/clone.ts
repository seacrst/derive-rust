export function clone<T>(value: T): T {
  
  if (value !== null && typeof value !== "object") {
    return value;
  }

  if (value === null) {
    return value;
  }
  
  if (typeof value !== "function" && !Array.isArray(value) && !(value instanceof Map) && !(value instanceof Set) && !(value instanceof Promise)) {
    return {
      ...Object.fromEntries(Object.entries(value!)
        .filter(([_, val]) => typeof val !== "function")
        .map(([key, val]) => [clone(key), clone(val)])),
      ...Object.fromEntries(Object.entries(value!)
        .filter(([_, val]) => typeof val === "function"))
    } as T
  }

  if (value instanceof Map) {
    const map = new Map();
    value.forEach((v, k) => {
      map.set(clone(k), clone(v));
    });

    return map as T;
  }

  if (value instanceof Set) {
    const set = new Set();
    value.forEach((v) => {
      set.add(clone(v));
    });

    return set as T;
  }

  if (Array.isArray(value)) {
    return value.map(v => clone(v)) as T
  }

  return value;
}