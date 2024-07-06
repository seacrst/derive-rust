export function ex<T, V>(fn: (value: V) => T, value?: V): T {
  return fn(value!)
}

export function dex<I, O, V>(input: (value: V) => I, output: (value: ReturnType<typeof input>) => O, value?: V) {
  return output(input(value!));
}