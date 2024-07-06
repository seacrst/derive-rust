export function implStruct<S>(target: S, self: S) {
  for (const key in self) {
    target[key] = self[key];
  }
}