export function impl<S>(target: S, self: S, seal: boolean = true) {
  for (const key in self) {
    if (typeof self[key] === "function") {
      continue;
    }
    
    target[key] = self[key];
  }
  seal && Object.seal(target);
}