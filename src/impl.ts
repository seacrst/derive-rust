export function impl<S>(target: S, self: S, seal: boolean = true) {
  for (const key in self) {
    if (typeof self[key] === "function") {
      continue;
    }
    
    target[key] = self[key];
  }
  seal && Object.seal(target);
}

export function isObject(value: any): boolean {
  return (
    typeof value === "object" && 
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof Map) &&
    !(value instanceof Set) &&
    !(value instanceof WeakMap) &&
    !(value instanceof WeakSet) &&
    !(value instanceof Promise) &&
    !(value instanceof RegExp) &&
    !(value instanceof Function) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}